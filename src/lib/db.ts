import Database from "@tauri-apps/plugin-sql";
import type {
  InterruptReason,
  Mode,
  SelfReview,
  Session,
  Tag,
} from "../types";

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

export async function listTags(modeId: number): Promise<Tag[]> {
  const db = await getDb();
  return db.select<Tag[]>(
    "SELECT id, mode_id, key, label, color, archived FROM tags WHERE mode_id = $1 AND archived = 0 ORDER BY id",
    [modeId],
  );
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
