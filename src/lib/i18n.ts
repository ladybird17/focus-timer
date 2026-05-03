import type { InterruptReason, ModeKey } from "../types";

export type Lang = "ko" | "en";

export interface Messages {
  // 공통
  start: string;
  complete: string;
  interrupt: string;
  cancel: string;
  deleteWord: string;
  doneClose: string;
  off: string;
  on: string;

  // 헤더 / 시간 라벨
  todayBaseSuffix: (hm: string) => string; // "{시각} 기준"
  none: string; // "—"

  // ViewTabs
  tabTimer: string;
  tabToday: string;

  // 시간 포맷 (formatDuration)
  durationMinOnly: (m: number) => string; // "12분" / "12 min"
  durationHourMin: (h: number, m: number) => string; // "1시간 23분" / "1h 23m"

  // 시작 버튼 영역의 에러 prefix는 그대로 message만 표시하므로 별도 미정의

  // Today 페이지
  filterAll: string;
  filterWork: string;
  filterStudy: string;
  kpiTotalFocus: string;
  kpiCompleted: string;
  kpiBestStreak: string;
  countSuffix: (n: number) => string; // "회" / "x"
  stoppedHint: (n: number) => string;
  streakValue: (n: number) => string; // "{n}연속"
  sectionTagDistribution: string;
  sectionTimeline: string;
  sectionInterruptReasons: string;
  loading: string;

  // 차트 빈 상태 / 툴팁
  donutEmpty: string;
  donutCenterLabel: string; // "총 집중"
  timelineEmpty: string;
  interruptEmpty: string;
  statusCompleted: string;
  statusInterrupted: string;
  countTimes: (n: number) => string; // "{n}회" / "{n}x"
  sessionsCount: (n: number) => string; // "{n}세션" / "{n} sessions"

  // 테마 선택
  themeLabel: string;

  // Settings 모달
  settingsTitle: string;
  soundLabel: string;
  soundDesc: string;
  beepCountSuffix: (n: 1 | 3) => string; // "1회"/"3회" → "1×"/"3×"
  flashLabel: string;
  flashDesc: string;
  dayStartLabel: string;
  dayStartDesc: string;
  dayStartUnit: string; // "기준"
  langLabel: string;
  langKo: string;
  langEn: string;
  dataLabel: string;
  resetTodayDesc: string;
  resetTodayBtn: string;
  resetConfirm: string;
  resetting: string;
  resetDoneMsg: (n: number) => string;
  resetErrorMsg: (e: string) => string;
  resetErrorGeneric: string;

  // Interrupt 모달
  interruptTitle: string;
  interruptDesc: string;

  // Review 모달
  reviewTitle: string;
  reviewDesc: string;
  reviewFocused: string;
  reviewDistracted: string;

  // 알림
  notifyTitle: string;
  notifyBody: (tagLabel: string) => string;

  // 인터럽트 사유 라벨 (key → 표시명)
  reason: Record<InterruptReason, string>;

  // Mode key → 표시명 (영어 모드용)
  mode: Record<ModeKey, string>;

  // Tag key → 표시명 (영어 모드용)
  tag: Record<string, string>;
}

const ko: Messages = {
  start: "시작",
  complete: "완료",
  interrupt: "중단",
  cancel: "취소",
  deleteWord: "삭제",
  doneClose: "완료",
  off: "끄기",
  on: "켜기",

  todayBaseSuffix: (hm) => `${hm} 기준`,
  none: "—",

  tabTimer: "타이머",
  tabToday: "오늘",

  durationMinOnly: (m) => `${m}분`,
  durationHourMin: (h, m) => `${h}시간 ${m}분`,

  filterAll: "전체",
  filterWork: "업무",
  filterStudy: "공부",
  kpiTotalFocus: "총 집중시간",
  kpiCompleted: "완료 세션",
  kpiBestStreak: "베스트 스트릭",
  countSuffix: (n) => `${n}회`,
  stoppedHint: (n) => `중단 ${n}회`,
  streakValue: (n) => `${n}연속`,
  sectionTagDistribution: "태그별 분포",
  sectionTimeline: "타임라인",
  sectionInterruptReasons: "인터럽트 사유",
  loading: "불러오는 중…",

  donutEmpty: "완료된 세션이 없습니다",
  donutCenterLabel: "총 집중",
  timelineEmpty: "세션이 없습니다",
  interruptEmpty: "인터럽트 기록 없음",
  statusCompleted: "완료",
  statusInterrupted: "중단",
  countTimes: (n) => `${n}회`,
  sessionsCount: (n) => `${n}세션`,

  themeLabel: "테마",

  settingsTitle: "설정",
  soundLabel: "알림음",
  soundDesc: "세션이 끝날 때 들리는 비프음 횟수",
  beepCountSuffix: (n) => `${n}회`,
  flashLabel: "깜빡임",
  flashDesc: "알림음과 동시에 다이얼이 밝게 빛남",
  dayStartLabel: "하루 시작 시각",
  dayStartDesc:
    '"오늘"의 기준 시각. 예: 5시 → 5월 3일은 5월 3일 5시 ~ 5월 4일 5시 직전',
  dayStartUnit: "기준",
  langLabel: "언어",
  langKo: "한국어",
  langEn: "English",
  dataLabel: "데이터",
  resetTodayDesc: "오늘 시작된 모든 세션 기록을 삭제합니다. 되돌릴 수 없어요.",
  resetTodayBtn: "오늘 기록 초기화",
  resetConfirm: "정말 초기화할까요?",
  resetting: "삭제중...",
  resetDoneMsg: (n) => `${n}개 세션이 삭제되었습니다`,
  resetErrorMsg: (e) => `오류: ${e}`,
  resetErrorGeneric: "오류가 발생했습니다",

  interruptTitle: "중단 사유",
  interruptDesc: "왜 세션이 끊겼나요?",

  reviewTitle: "세션 완료",
  reviewDesc: "이번 세션, 어땠나요?",
  reviewFocused: "집중 잘됨",
  reviewDistracted: "흐트러짐",

  notifyTitle: "집중 세션 완료",
  notifyBody: (tagLabel) => `${tagLabel} 세션이 끝났습니다. 자기평가를 남겨주세요.`,

  reason: {
    urgent_inquiry: "급한 문의",
    meeting: "회의",
    cant_focus: "집중 안됨",
    deploy_incident: "배포/장애 대응",
    urgent_contact: "급한 연락",
    work_request: "업무 요청 옴",
    etc: "기타",
  },

  mode: {
    work: "업무",
    study: "공부",
  },

  tag: {
    bugfix: "버그픽스",
    api: "API",
    refactoring: "리팩토링",
    meeting: "회의",
    deploy: "배포",
    document: "문서",
    coding: "코딩 공부",
    reading: "독서/논문",
    tutorial: "튜토리얼",
    "side-project": "개인 프로젝트",
    review: "복습",
    certificate: "자격증",
    career: "커리어",
  },
};

const en: Messages = {
  start: "Start",
  complete: "Done",
  interrupt: "Stop",
  cancel: "Cancel",
  deleteWord: "Delete",
  doneClose: "Close",
  off: "Off",
  on: "On",

  todayBaseSuffix: (hm) => `from ${hm}`,
  none: "—",

  tabTimer: "Timer",
  tabToday: "Today",

  durationMinOnly: (m) => `${m} min`,
  durationHourMin: (h, m) => `${h}h ${m}m`,

  filterAll: "All",
  filterWork: "Work",
  filterStudy: "Study",
  kpiTotalFocus: "Total Focus",
  kpiCompleted: "Completed",
  kpiBestStreak: "Best Streak",
  countSuffix: (n) => `${n}×`,
  stoppedHint: (n) => `${n} stopped`,
  streakValue: (n) => `${n} in a row`,
  sectionTagDistribution: "By Tag",
  sectionTimeline: "Timeline",
  sectionInterruptReasons: "Interrupts",
  loading: "Loading…",

  donutEmpty: "No completed sessions",
  donutCenterLabel: "Focus",
  timelineEmpty: "No sessions",
  interruptEmpty: "No interrupts",
  statusCompleted: "Done",
  statusInterrupted: "Stopped",
  countTimes: (n) => `${n}×`,
  sessionsCount: (n) => `${n} session${n === 1 ? "" : "s"}`,

  themeLabel: "Theme",

  settingsTitle: "Settings",
  soundLabel: "Notification Sound",
  soundDesc: "Number of beeps when a session ends",
  beepCountSuffix: (n) => `${n}×`,
  flashLabel: "Flash",
  flashDesc: "Dial flashes brightly with the sound",
  dayStartLabel: "Day Start Time",
  dayStartDesc:
    'Defines the start of "today". e.g. 5 AM → May 3 means May 3 05:00 to just before May 4 05:00',
  dayStartUnit: "start",
  langLabel: "Language",
  langKo: "한국어",
  langEn: "English",
  dataLabel: "Data",
  resetTodayDesc: "Delete all sessions started today. This can't be undone.",
  resetTodayBtn: "Reset Today",
  resetConfirm: "Reset for sure?",
  resetting: "Deleting…",
  resetDoneMsg: (n) =>
    `${n} session${n === 1 ? "" : "s"} deleted`,
  resetErrorMsg: (e) => `Error: ${e}`,
  resetErrorGeneric: "An error occurred",

  interruptTitle: "Why stopped?",
  interruptDesc: "What interrupted your session?",

  reviewTitle: "Session Complete",
  reviewDesc: "How was this session?",
  reviewFocused: "Focused",
  reviewDistracted: "Distracted",

  notifyTitle: "Session Complete",
  notifyBody: (tagLabel) =>
    `Your ${tagLabel} session ended. Please leave a review.`,

  reason: {
    urgent_inquiry: "Urgent inquiry",
    meeting: "Meeting",
    cant_focus: "Can't focus",
    deploy_incident: "Deploy / incident",
    urgent_contact: "Urgent contact",
    work_request: "Work request",
    etc: "Other",
  },

  mode: {
    work: "Work",
    study: "Study",
  },

  tag: {
    bugfix: "Bugfix",
    api: "API",
    refactoring: "Refactoring",
    meeting: "Meeting",
    deploy: "Deploy",
    document: "Documentation",
    coding: "Coding Practice",
    reading: "Reading / Papers",
    tutorial: "Tutorial",
    "side-project": "Side Project",
    review: "Review",
    certificate: "Certificate",
    career: "Career",
  },
};

export const MESSAGES: Record<Lang, Messages> = { ko, en };

/** date-fns/Intl 없이 ko/en에 맞춘 날짜 라벨 */
export function formatDateLabel(date: Date, lang: Lang): string {
  if (lang === "ko") {
    const dateStr = date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
    const wd = date.toLocaleDateString("ko-KR", { weekday: "short" });
    return `${dateStr} (${wd})`;
  }
  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const wd = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${dateStr} (${wd})`;
}
