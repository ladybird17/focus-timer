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
  color: string | null;
  archived: number;
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

export const INTERRUPT_REASONS_WORK: { key: InterruptReason; label: string }[] = [
  { key: "urgent_inquiry", label: "급한 문의" },
  { key: "meeting", label: "회의" },
  { key: "cant_focus", label: "집중 안됨" },
  { key: "deploy_incident", label: "배포/장애 대응" },
  { key: "etc", label: "기타" },
];

export const INTERRUPT_REASONS_STUDY: { key: InterruptReason; label: string }[] = [
  { key: "cant_focus", label: "집중 안됨" },
  { key: "urgent_contact", label: "급한 연락" },
  { key: "work_request", label: "업무 요청 옴" },
  { key: "etc", label: "기타" },
];

export function interruptReasonsFor(modeKey: ModeKey) {
  return modeKey === "study" ? INTERRUPT_REASONS_STUDY : INTERRUPT_REASONS_WORK;
}

export const PRESETS_MIN = [5, 10, 20, 30, 40, 50, 60];
