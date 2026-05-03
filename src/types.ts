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
