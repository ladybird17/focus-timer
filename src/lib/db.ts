import Database from "@tauri-apps/plugin-sql";
import type {
  InterruptReason,
  Mode,
  SelfReview,
  Session,
  Tag,
} from "../types";
import { MAX_TAGS_PER_MODE, pickTagColor } from "../types";

let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:focus.db");
  }
  return dbPromise;
}

export async function listModes(): Promise<Mode[]> {
  const db = await getDb();
  return db.select<Mode[]>("SELECT id, key, label FROM modes ORDER BY id");
}

const TAG_COLUMNS =
  "SELECT id, mode_id, key, label, label_en, color, archived FROM tags";

export async function listTags(modeId: number): Promise<Tag[]> {
  const db = await getDb();
  return db.select<Tag[]>(
    `${TAG_COLUMNS} WHERE mode_id = $1 AND archived = 0 ORDER BY id`,
    [modeId],
  );
}

/** 태그 추가/삭제 실패 사유 — 화면에서 i18n으로 문구를 붙인다. */
export type TagErrorCode =
  | "EMPTY_LABEL"
  | "TAG_LIMIT"
  | "DUPLICATE_TAG"
  | "TAG_NOT_FOUND"
  | "TAG_IN_USE"
  | "LAST_TAG";

export class TagError extends Error {
  constructor(public code: TagErrorCode) {
    super(code);
    this.name = "TagError";
  }
}

/** 라벨 → 태그 key. 영문 라벨을 우선 쓰고, 없으면 한글 라벨을 그대로 슬러그로. */
function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** UNIQUE(mode_id, key) 충돌 방지 — 아카이브된 태그의 key도 후보에서 제외한다. */
function uniqueTagKey(label: string, labelEn: string, existing: Tag[]): string {
  const base = slugify(labelEn) || slugify(label) || "tag";
  const taken = new Set(existing.map((tg) => tg.key));
  if (!taken.has(base)) return base;
  for (let i = 2; ; i += 1) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export interface CreateTagInput {
  modeId: number;
  label: string;
  /** 비우면 한글 라벨을 그대로 쓴다 */
  labelEn?: string;
  color?: string;
}

/**
 * 태그 추가.
 * 같은 모드에 같은 이름의 아카이브된 태그가 있으면 새로 만들지 않고 되살린다.
 * (UNIQUE(mode_id, key) 충돌을 피하고, 과거 세션이 그 태그에 그대로 붙어 있게 하려는 목적)
 */
export async function createTag(input: CreateTagInput): Promise<Tag> {
  const db = await getDb();
  const label = input.label.trim();
  if (!label) throw new TagError("EMPTY_LABEL");

  // 아카이브된 것까지 모두 — 개수 제한은 활성 태그만, key 충돌은 전체 기준
  const all = await db.select<Tag[]>(
    `${TAG_COLUMNS} WHERE mode_id = $1 ORDER BY id`,
    [input.modeId],
  );
  const active = all.filter((tg) => tg.archived === 0);
  if (active.length >= MAX_TAGS_PER_MODE) throw new TagError("TAG_LIMIT");
  if (active.some((tg) => tg.label === label)) {
    throw new TagError("DUPLICATE_TAG");
  }

  const labelEn = (input.labelEn ?? "").trim() || label;
  const color = input.color ?? pickTagColor(active.map((tg) => tg.color));

  const archivedSame = all.find((tg) => tg.archived === 1 && tg.label === label);
  if (archivedSame) {
    await db.execute(
      "UPDATE tags SET archived = 0, label_en = $1, color = $2 WHERE id = $3",
      [labelEn, color, archivedSame.id],
    );
    return { ...archivedSame, archived: 0, label_en: labelEn, color };
  }

  const key = uniqueTagKey(label, labelEn, all);
  const result = await db.execute(
    "INSERT INTO tags (mode_id, key, label, label_en, color, archived) VALUES ($1, $2, $3, $4, $5, 0)",
    [input.modeId, key, label, labelEn, color],
  );
  return {
    id: result.lastInsertId as number,
    mode_id: input.modeId,
    key,
    label,
    label_en: labelEn,
    color,
    archived: 0,
  };
}

/**
 * 태그 삭제 = 소프트 삭제(archived = 1).
 * 통계 쿼리의 JOIN은 archived를 보지 않으므로 과거 세션과 집계는 그대로 유지된다.
 */
export async function archiveTag(tagId: number): Promise<void> {
  const db = await getDb();
  const rows = await db.select<Tag[]>(`${TAG_COLUMNS} WHERE id = $1`, [tagId]);
  const tag = rows[0];
  if (!tag) throw new TagError("TAG_NOT_FOUND");

  const inUse = await db.select<{ n: number }[]>(
    "SELECT COUNT(*) AS n FROM sessions WHERE tag_id = $1 AND status = 'running'",
    [tagId],
  );
  if ((inUse[0]?.n ?? 0) > 0) throw new TagError("TAG_IN_USE");

  // 태그가 하나도 없으면 세션을 시작할 수 없으므로 마지막 하나는 남긴다
  const remaining = await db.select<{ n: number }[]>(
    "SELECT COUNT(*) AS n FROM tags WHERE mode_id = $1 AND archived = 0",
    [tag.mode_id],
  );
  if ((remaining[0]?.n ?? 0) <= 1) throw new TagError("LAST_TAG");

  await db.execute("UPDATE tags SET archived = 1 WHERE id = $1", [tagId]);
}

export interface StartSessionInput {
  modeId: number;
  tagId: number;
  plannedMin: number;
}

export async function startSession(input: StartSessionInput): Promise<number> {
  const db = await getDb();
  const startedAt = new Date().toISOString();
  const result = await db.execute(
    "INSERT INTO sessions (mode_id, tag_id, planned_min, started_at, status) VALUES ($1, $2, $3, $4, 'running')",
    [input.modeId, input.tagId, input.plannedMin, startedAt],
  );
  return result.lastInsertId as number;
}

export async function completeSession(
  id: number,
  selfReview: SelfReview,
): Promise<void> {
  const db = await getDb();
  const endedAt = new Date().toISOString();
  await db.execute(
    "UPDATE sessions SET ended_at = $1, status = 'completed', self_review = $2 WHERE id = $3",
    [endedAt, selfReview, id],
  );
}

export async function interruptSession(
  id: number,
  reason: InterruptReason,
): Promise<void> {
  const db = await getDb();
  const endedAt = new Date().toISOString();
  await db.execute(
    "UPDATE sessions SET ended_at = $1, status = 'interrupted', interrupt_reason = $2 WHERE id = $3",
    [endedAt, reason, id],
  );
}

export async function getRunningSession(): Promise<Session | null> {
  const db = await getDb();
  const rows = await db.select<Session[]>(
    "SELECT * FROM sessions WHERE status = 'running' ORDER BY id DESC LIMIT 1",
  );
  return rows[0] ?? null;
}

export async function deleteTodaySessions(): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    "DELETE FROM sessions WHERE date(started_at, 'localtime') = date('now', 'localtime')",
  );
  return result.rowsAffected;
}
