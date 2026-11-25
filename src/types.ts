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

/** 팔레트 한 줄의 색 수 — TagPicker 가 이 열 수로 격자를 그린다 */
export const TAG_PALETTE_COLUMNS = 12;

/**
 * 태그 색 팔레트 — 12색상 × 3톤. 한 줄(12개)이 한 톤이다: 연함 / 기본 / 진함.
 * 팔레트에 없는 색도 HEX 코드로 직접 지정할 수 있다 (tags.color 는 자유 #hex).
 */
export const TAG_PALETTE = [
  // 연함
  "#fca5a5", "#fdba74", "#fcd34d", "#bef264", "#86efac", "#5eead4",
  "#67e8f9", "#93c5fd", "#a5b4fc", "#c4b5fd", "#f9a8d4", "#d4d4d8",
  // 기본
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#71717a",
  // 진함
  "#b91c1c", "#c2410c", "#b45309", "#4d7c0f", "#15803d", "#0f766e",
  "#0e7490", "#1d4ed8", "#4338ca", "#6d28d9", "#be185d", "#3f3f46",
];

/** 자동 추천 순서: 기본 톤 → 진한 톤 → 연한 톤 (연한 색은 글자가 덜 읽혀서 마지막) */
const PICK_ORDER = [
  ...TAG_PALETTE.slice(TAG_PALETTE_COLUMNS, TAG_PALETTE_COLUMNS * 2),
  ...TAG_PALETTE.slice(TAG_PALETTE_COLUMNS * 2),
  ...TAG_PALETTE.slice(0, TAG_PALETTE_COLUMNS),
];

/** 이미 쓰이는 색은 피해서 팔레트에서 다음 색을 고른다. */
export function pickTagColor(usedColors: (string | null)[]): string {
  const used = new Set(usedColors.filter((c): c is string => !!c));
  return (
    PICK_ORDER.find((c) => !used.has(c)) ??
    PICK_ORDER[used.size % PICK_ORDER.length]
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
