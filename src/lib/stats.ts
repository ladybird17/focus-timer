import { getDb } from "./db";
import type { InterruptReason, ModeKey, SelfReview } from "../types";

/** 세션 + 태그/모드 라벨이 조인된 형태 */
export interface SessionRow {
  id: number;
  mode_id: number;
  mode_key: ModeKey;
  tag_id: number;
  tag_key: string;
  tag_label: string;
  tag_color: string | null;
  planned_min: number;
  started_at: string;
  ended_at: string | null;
  status: "running" | "completed" | "interrupted";
  interrupt_reason: InterruptReason | null;
  self_review: SelfReview | null;
}

/**
 * "오늘"의 시작·끝 ISO 시각.
 * dayStartHour=5 이고 현재가 새벽 3시면 "어제 5시 ~ 오늘 5시"가 "오늘"로 잡힘.
 */
export function todayRange(dayStartHour: number): {
  fromIso: string;
  toIso: string;
} {
  const now = new Date();
  const start = new Date(now);
  start.setHours(dayStartHour, 0, 0, 0);
  if (now.getTime() < start.getTime()) {
    start.setDate(start.getDate() - 1);
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { fromIso: start.toISOString(), toIso: end.toISOString() };
}

/**
 * 기간 내 세션 조회. started_at 오름차순.
 * running 세션은 ended_at이 null인데도 진행 중이면 분석에서 제외.
 */
export async function getSessionsBetween(
  fromIso: string,
  toIso: string,
): Promise<SessionRow[]> {
  const db = await getDb();
  const rows = await db.select<SessionRow[]>(
    `SELECT
       s.id, s.mode_id, m.key AS mode_key,
       s.tag_id, t.key AS tag_key, t.label AS tag_label, t.color AS tag_color,
       s.planned_min, s.started_at, s.ended_at, s.status,
       s.interrupt_reason, s.self_review
     FROM sessions s
     JOIN modes m ON m.id = s.mode_id
     JOIN tags  t ON t.id = s.tag_id
     WHERE s.started_at >= $1 AND s.started_at < $2
       AND s.status != 'running'
     ORDER BY s.started_at ASC`,
    [fromIso, toIso],
  );
  return rows;
}

/** 세션의 실제 지속 시간(ms). ended_at이 없으면 0. */
export function durationMs(s: SessionRow): number {
  if (!s.ended_at) return 0;
  return new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
}

/** 완료(completed)된 세션의 총 집중시간(ms) */
export function totalFocusMs(sessions: SessionRow[]): number {
  return sessions
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + durationMs(s), 0);
}

export function completedCount(sessions: SessionRow[]): number {
  return sessions.filter((s) => s.status === "completed").length;
}

export function interruptedCount(sessions: SessionRow[]): number {
  return sessions.filter((s) => s.status === "interrupted").length;
}

/** 태그별 집중시간 분포 (도넛용). 0인 항목 제외, ms 내림차순. */
export interface TagSlice {
  tagId: number;
  tagKey: string;
  tagLabel: string;
  color: string;
  ms: number;
  count: number;
}

const FALLBACK_COLOR = "#a1a1aa";

export function tagDistribution(sessions: SessionRow[]): TagSlice[] {
  const map = new Map<number, TagSlice>();
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    const ms = durationMs(s);
    if (ms <= 0) continue;
    const cur = map.get(s.tag_id);
    if (cur) {
      cur.ms += ms;
      cur.count += 1;
    } else {
      map.set(s.tag_id, {
        tagId: s.tag_id,
        tagKey: s.tag_key,
        tagLabel: s.tag_label,
        color: s.tag_color ?? FALLBACK_COLOR,
        ms,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.ms - a.ms);
}

/** 자기평가 집계 — completed 세션 중 focused / distracted 비율 */
export interface ReviewBreakdown {
  focused: number;
  distracted: number;
  reviewedTotal: number;
  focusedRate: number; // 0~1
}

export function reviewBreakdown(sessions: SessionRow[]): ReviewBreakdown {
  let focused = 0;
  let distracted = 0;
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    if (s.self_review === "focused") focused += 1;
    else if (s.self_review === "distracted") distracted += 1;
  }
  const reviewedTotal = focused + distracted;
  const focusedRate = reviewedTotal > 0 ? focused / reviewedTotal : 0;
  return { focused, distracted, reviewedTotal, focusedRate };
}

/** 인터럽트 사유 분포 — 라벨은 표시 시점에 i18n 매핑 */
export interface InterruptSlice {
  reason: InterruptReason;
  count: number;
}

export function interruptDistribution(
  sessions: SessionRow[],
): InterruptSlice[] {
  const map = new Map<InterruptReason, InterruptSlice>();
  for (const s of sessions) {
    if (s.status !== "interrupted" || !s.interrupt_reason) continue;
    const r = s.interrupt_reason;
    const cur = map.get(r);
    if (cur) cur.count += 1;
    else map.set(r, { reason: r, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/**
 * 베스트 스트릭 — 인터럽트 없이 연속된 completed 세션 중 가장 긴 구간.
 * sessions는 started_at 오름차순이라고 가정.
 */
export interface BestStreak {
  count: number;
  fromIso: string;
  toIso: string;
}

export function bestStreak(sessions: SessionRow[]): BestStreak | null {
  let best: BestStreak | null = null;
  let curr: BestStreak | null = null;

  for (const s of sessions) {
    if (s.status === "completed") {
      const endIso = s.ended_at ?? s.started_at;
      if (!curr) {
        curr = { count: 1, fromIso: s.started_at, toIso: endIso };
      } else {
        curr.count += 1;
        curr.toIso = endIso;
      }
      if (!best || curr.count > best.count) best = { ...curr };
    } else if (s.status === "interrupted") {
      curr = null;
    }
  }
  return best;
}

/** 타임라인 자동 범위 — 첫 세션의 시작 ~ 마지막 세션의 끝 */
export function timelineRange(
  sessions: SessionRow[],
): { fromMs: number; toMs: number } | null {
  if (sessions.length === 0) return null;
  const fromMs = new Date(sessions[0].started_at).getTime();
  let toMs = fromMs;
  for (const s of sessions) {
    const end = s.ended_at
      ? new Date(s.ended_at).getTime()
      : new Date(s.started_at).getTime();
    if (end > toMs) toMs = end;
  }
  return { fromMs, toMs };
}

/** 모드 필터 */
export type ModeFilter = "all" | ModeKey;

export function filterByMode(
  sessions: SessionRow[],
  filter: ModeFilter,
): SessionRow[] {
  if (filter === "all") return sessions;
  return sessions.filter((s) => s.mode_key === filter);
}

/**
 * dayStartHour 기준으로 logical day key (yyyy-mm-dd) 계산.
 * 예: dayStartHour=5, 새벽 3시 → "어제" 날짜로 계산.
 */
function logicalDayKey(date: Date, dayStartHour: number): string {
  const d = new Date(date);
  d.setHours(d.getHours() - dayStartHour);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** completed 세션이 있는 logical day 목록 (최근 → 과거). 모드 필터 적용 가능. */
export async function getCompletedDays(
  dayStartHour: number,
  filter: ModeFilter = "all",
): Promise<Set<string>> {
  const db = await getDb();
  const where =
    filter === "all"
      ? "s.status = 'completed'"
      : "s.status = 'completed' AND m.key = $1";
  const params = filter === "all" ? [] : [filter];
  const rows = await db.select<{ started_at: string }[]>(
    `SELECT s.started_at
     FROM sessions s
     JOIN modes m ON m.id = s.mode_id
     WHERE ${where}
     ORDER BY s.started_at DESC
     LIMIT 2000`,
    params,
  );
  const days = new Set<string>();
  for (const r of rows) {
    days.add(logicalDayKey(new Date(r.started_at), dayStartHour));
  }
  return days;
}

/**
 * 데일리 스트릭 — 오늘(또는 어제)부터 거꾸로 거슬러 올라가며 completed 세션이 있는 연속 일수.
 * - 오늘 갱신했으면 오늘 포함, 아직 안 했으면 어제까지로 계산.
 */
export interface DailyStreak {
  count: number;
  updatedToday: boolean;
}

export function dailyStreak(
  days: Set<string>,
  dayStartHour: number,
  now: Date = new Date(),
): DailyStreak {
  const todayKey = logicalDayKey(now, dayStartHour);
  const updatedToday = days.has(todayKey);

  const cursor = new Date(now);
  cursor.setHours(cursor.getHours() - dayStartHour);
  if (!updatedToday) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let count = 0;
  while (true) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    if (!days.has(key)) break;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { count, updatedToday };
}
