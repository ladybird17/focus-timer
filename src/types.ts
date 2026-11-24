export type ModeKey = "work" | "study";

export interface Mode {
  id: number;
  key: ModeKey;
  label: string;
}

export interface Tag {
  id: number;
  mode_id: number;
  key: string;
  label: string;
  /** 영어 모드 표시명. 시드 태그는 null이고 i18n 사전(t.tag)에서 가져온다. */
  label_en: string | null;
  color: string | null;
  archived: number;
}

/** 모드당 사용할 수 있는 태그 개수 상한 */
export const MAX_TAGS_PER_MODE = 10;

/** 태그 색 팔레트 — 시드 태그가 쓰는 톤과 같은 계열 */
export const TAG_PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#71717a",
];

/** 이미 쓰이는 색은 피해서 팔레트에서 다음 색을 고른다. */
export function pickTagColor(usedColors: (string | null)[]): string {
  const used = new Set(usedColors.filter((c): c is string => !!c));
  return (
    TAG_PALETTE.find((c) => !used.has(c)) ??
    TAG_PALETTE[used.size % TAG_PALETTE.length]
  );
}

export type SessionStatus = "running" | "completed" | "interrupted";

export type InterruptReason =
  | "urgent_inquiry"
  | "meeting"
  | "cant_focus"
  | "deploy_incident"
  | "urgent_contact"
  | "work_request"
  | "etc";

export type SelfReview = "focused" | "distracted";

export interface Session {
  id: number;
  mode_id: number;
  tag_id: number;
  planned_min: number;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
  interrupt_reason: InterruptReason | null;
  self_review: SelfReview | null;
  note: string | null;
}

export const INTERRUPT_REASONS_WORK: InterruptReason[] = [
  "urgent_inquiry",
  "meeting",
  "cant_focus",
  "deploy_incident",
  "etc",
];

export const INTERRUPT_REASONS_STUDY: InterruptReason[] = [
  "cant_focus",
  "urgent_contact",
  "work_request",
  "etc",
];

export function interruptReasonsFor(modeKey: ModeKey): InterruptReason[] {
  return modeKey === "study" ? INTERRUPT_REASONS_STUDY : INTERRUPT_REASONS_WORK;
}

export const PRESETS_MIN = [5, 10, 20, 30, 40, 50, 60];
