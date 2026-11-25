import type { InterruptReason, ModeKey } from "../types";
import { MAX_TAGS_PER_MODE } from "../types";
import { STICKER, type BuiltinStickerKey } from "./stickers";

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
  tabPatterns: string;

  // 패턴 페이지
  patternsRangeWeek: string; // "최근 7일" / "Last 7 days"
  patternsRangeMonth: string; // "최근 30일" / "Last 30 days"
  patternsRangeSuffix: (fromLabel: string, toLabel: string) => string;
  sectionInterruptHeatmap: string;
  heatmapEmpty: string;
  heatmapTooltip: (dow: string, hour: number, count: number) => string;
  dowShort: [string, string, string, string, string, string, string]; // 월~일
  hourLabel: (h: number) => string;

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
  kpiDailyStreak: string;
  kpiFocusRate: string; // 집중도
  countSuffix: (n: number) => string; // "회" / "x"
  stoppedHint: (n: number) => string;
  streakValue: (n: number) => string; // "{n}연속"
  daysValue: (n: number) => string; // "{n}일" / "{n} day(s)"
  dailyStreakUpdatedToday: string; // 오늘 갱신
  dailyStreakPendingToday: string; // 오늘 아직
  focusRateValue: (rate: number) => string; // "{n}%"
  reviewHint: (focused: number, distracted: number) => string; // "잘됨 N · 흐트러짐 M"
  sectionTagDistribution: string;
  sectionTimeline: string;
  sectionInterruptReasons: string;
  sectionModeCompare: string;
  modeCompareEmpty: string;
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

  // 태그 추가 / 삭제
  tagAddAria: string;
  tagDeleteAria: (label: string) => string;
  tagNamePlaceholder: string;
  tagNameEnPlaceholder: string;
  tagAddSubmit: string;
  tagHexAria: string;
  tagHexInvalid: string;
  tagColorPickerAria: string;
  tagPreviewLabel: string;
  tagCount: (n: number, max: number) => string;
  tagDeleteConfirm: (label: string) => string;
  tagDeleteKeepsData: string;
  tagDeleteBtn: string;
  tagError: (code: string) => string;

  // 테마 선택
  themeLabel: string;
  /** 꾸미기 서랍 (테마 + 스티커) */
  decorLabel: string;

  // 스티커 꾸미기
  stickerLabel: string;
  stickerPickHint: string;
  stickerAdd: string;
  stickerFormatHint: string;
  stickerCount: (n: number, max: number) => string;
  stickerSize: string;
  stickerRotate: string;
  stickerRemove: string;
  stickerRemoveAll: string;
  stickerDelete: string;
  stickerName: Record<BuiltinStickerKey, string>;
  stickerError: (code: string) => string;

  // Settings 모달
  settingsTitle: string;
  soundLabel: string;
  soundDesc: string;
  beepCountSuffix: (n: 1 | 3) => string; // "1회"/"3회" → "1×"/"3×"
  flashLabel: string;
  flashDesc: string;
  miniModeLabel: string;
  miniModeDesc: string;
  exitMiniMode: string;
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
  tabPatterns: "패턴",

  patternsRangeWeek: "최근 7일",
  patternsRangeMonth: "최근 30일",
  patternsRangeSuffix: (from, to) => `${from} ~ ${to}`,
  sectionInterruptHeatmap: "인터럽트 시간대 히트맵",
  heatmapEmpty: "인터럽트 기록이 없습니다",
  heatmapTooltip: (dow, hour, count) =>
    `${dow} ${String(hour).padStart(2, "0")}시 · ${count}회`,
  dowShort: ["월", "화", "수", "목", "금", "토", "일"],
  hourLabel: (h) => `${h}`,

  durationMinOnly: (m) => `${m}분`,
  durationHourMin: (h, m) => `${h}시간 ${m}분`,

  filterAll: "전체",
  filterWork: "업무",
  filterStudy: "공부",
  kpiTotalFocus: "총 집중시간",
  kpiCompleted: "완료 세션",
  kpiBestStreak: "베스트 스트릭",
  kpiDailyStreak: "데일리 스트릭",
  kpiFocusRate: "집중도",
  countSuffix: (n) => `${n}회`,
  stoppedHint: (n) => `중단 ${n}회`,
  streakValue: (n) => `${n}연속`,
  daysValue: (n) => `${n}일`,
  dailyStreakUpdatedToday: "오늘 갱신",
  dailyStreakPendingToday: "오늘 아직",
  focusRateValue: (rate) => `${Math.round(rate * 100)}%`,
  reviewHint: (f, d) => `잘됨 ${f} · 흐트러짐 ${d}`,
  sectionTagDistribution: "태그별 분포",
  sectionTimeline: "타임라인",
  sectionInterruptReasons: "인터럽트 사유",
  sectionModeCompare: "모드별 비교",
  modeCompareEmpty: "비교할 세션이 없습니다",
  loading: "불러오는 중…",

  donutEmpty: "완료된 세션이 없습니다",
  donutCenterLabel: "총 집중",
  timelineEmpty: "세션이 없습니다",
  interruptEmpty: "인터럽트 기록 없음",
  statusCompleted: "완료",
  statusInterrupted: "중단",
  countTimes: (n) => `${n}회`,
  sessionsCount: (n) => `${n}세션`,

  tagAddAria: "태그 추가",
  tagDeleteAria: (label) => `${label} 태그 삭제`,
  tagNamePlaceholder: "태그 이름",
  tagNameEnPlaceholder: "English (선택)",
  tagAddSubmit: "추가",
  tagHexAria: "색 코드 (HEX)",
  tagHexInvalid: "#rgb 또는 #rrggbb",
  tagColorPickerAria: "색 선택기 열기",
  tagPreviewLabel: "미리보기",
  tagCount: (n, max) => `${n} / ${max}`,
  tagDeleteConfirm: (label) => `「${label}」 태그를 삭제할까요?`,
  tagDeleteKeepsData: "이 태그로 쌓인 지난 기록과 통계는 그대로 유지됩니다.",
  tagDeleteBtn: "삭제",
  tagError: (code) => {
    switch (code) {
      case "EMPTY_LABEL":
        return "태그 이름을 입력해주세요";
      case "TAG_LIMIT":
        return `태그는 모드당 최대 ${MAX_TAGS_PER_MODE}개까지예요`;
      case "DUPLICATE_TAG":
        return "같은 이름의 태그가 이미 있어요";
      case "TAG_IN_USE":
        return "진행 중인 세션이 쓰고 있는 태그예요";
      case "LAST_TAG":
        return "마지막 남은 태그는 삭제할 수 없어요";
      case "TAG_NOT_FOUND":
        return "태그를 찾을 수 없어요";
      default:
        return `오류: ${code}`;
    }
  },

  themeLabel: "테마",
  decorLabel: "꾸미기",

  stickerLabel: "스티커",
  stickerPickHint: "눌러서 붙이고, 시계 위에서 끌어 옮겨요.",
  stickerAdd: "+ 내 스티커 등록",
  stickerFormatHint: `PNG·WebP·SVG·GIF, ${STICKER.maxBytes / 1024}KB 이하`,
  stickerCount: (n, max) => `${n} / ${max}개 붙임`,
  stickerSize: "크기",
  stickerRotate: "회전",
  stickerRemove: "떼기",
  stickerRemoveAll: "모두 떼기",
  stickerDelete: "서랍에서 삭제",
  stickerName: { clover: "네잎클로버", star: "별", coffee: "커피" },
  stickerError: (code) => {
    switch (code) {
      case "BAD_FORMAT":
        return "PNG·WebP·SVG·GIF 파일만 등록할 수 있어요.";
      case "TOO_LARGE":
        return `파일이 너무 커요. ${STICKER.maxBytes / 1024}KB 이하만 등록할 수 있어요.`;
      case "DECODE_FAILED":
        return "이미지를 읽지 못했어요.";
      case "LIMIT":
        return `스티커는 ${STICKER.maxCount}개까지 붙일 수 있어요.`;
      default:
        return code;
    }
  },

  settingsTitle: "설정",
  soundLabel: "알림음",
  soundDesc: "세션이 끝날 때 들리는 비프음 횟수",
  beepCountSuffix: (n) => `${n}회`,
  flashLabel: "깜빡임",
  flashDesc: "알림음과 동시에 다이얼이 밝게 빛남",
  miniModeLabel: "미니 모드",
  miniModeDesc: "작은 창으로 오른쪽 위에 고정되고 항상 위에 표시됩니다",
  exitMiniMode: "미니 모드 해제",
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
    dev: "개발",
    language: "어학",
    coding: "코딩",
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
  tabPatterns: "Patterns",

  patternsRangeWeek: "Last 7 days",
  patternsRangeMonth: "Last 30 days",
  patternsRangeSuffix: (from, to) => `${from} – ${to}`,
  sectionInterruptHeatmap: "Interrupt Heatmap",
  heatmapEmpty: "No interrupts recorded",
  heatmapTooltip: (dow, hour, count) =>
    `${dow} ${String(hour).padStart(2, "0")}:00 · ${count}×`,
  dowShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  hourLabel: (h) => `${h}`,

  durationMinOnly: (m) => `${m} min`,
  durationHourMin: (h, m) => `${h}h ${m}m`,

  filterAll: "All",
  filterWork: "Work",
  filterStudy: "Study",
  kpiTotalFocus: "Total Focus",
  kpiCompleted: "Completed",
  kpiBestStreak: "Best Streak",
  kpiDailyStreak: "Daily Streak",
  kpiFocusRate: "Focus Rate",
  countSuffix: (n) => `${n}×`,
  stoppedHint: (n) => `${n} stopped`,
  streakValue: (n) => `${n} in a row`,
  daysValue: (n) => `${n} day${n === 1 ? "" : "s"}`,
  dailyStreakUpdatedToday: "Updated today",
  dailyStreakPendingToday: "Not yet today",
  focusRateValue: (rate) => `${Math.round(rate * 100)}%`,
  reviewHint: (f, d) => `Focused ${f} · Distracted ${d}`,
  sectionTagDistribution: "By Tag",
  sectionTimeline: "Timeline",
  sectionInterruptReasons: "Interrupts",
  sectionModeCompare: "By Mode",
  modeCompareEmpty: "No sessions to compare",
  loading: "Loading…",

  donutEmpty: "No completed sessions",
  donutCenterLabel: "Focus",
  timelineEmpty: "No sessions",
  interruptEmpty: "No interrupts",
  statusCompleted: "Done",
  statusInterrupted: "Stopped",
  countTimes: (n) => `${n}×`,
  sessionsCount: (n) => `${n} session${n === 1 ? "" : "s"}`,

  tagAddAria: "Add tag",
  tagDeleteAria: (label) => `Delete tag ${label}`,
  tagNamePlaceholder: "Tag name",
  tagNameEnPlaceholder: "English (optional)",
  tagAddSubmit: "Add",
  tagHexAria: "Color code (HEX)",
  tagHexInvalid: "#rgb or #rrggbb",
  tagColorPickerAria: "Open color picker",
  tagPreviewLabel: "Preview",
  tagCount: (n, max) => `${n} / ${max}`,
  tagDeleteConfirm: (label) => `Delete the "${label}" tag?`,
  tagDeleteKeepsData: "Past sessions and stats for this tag stay intact.",
  tagDeleteBtn: "Delete",
  tagError: (code) => {
    switch (code) {
      case "EMPTY_LABEL":
        return "Please enter a tag name";
      case "TAG_LIMIT":
        return `Up to ${MAX_TAGS_PER_MODE} tags per mode`;
      case "DUPLICATE_TAG":
        return "A tag with that name already exists";
      case "TAG_IN_USE":
        return "A running session is using this tag";
      case "LAST_TAG":
        return "Can't delete the last remaining tag";
      case "TAG_NOT_FOUND":
        return "Tag not found";
      default:
        return `Error: ${code}`;
    }
  },

  themeLabel: "Theme",
  decorLabel: "Decorate",

  stickerLabel: "Stickers",
  stickerPickHint: "Click to stick, then drag it on the timer.",
  stickerAdd: "+ Add my sticker",
  stickerFormatHint: `PNG, WebP, SVG, GIF up to ${STICKER.maxBytes / 1024}KB`,
  stickerCount: (n, max) => `${n} / ${max} placed`,
  stickerSize: "Size",
  stickerRotate: "Rotate",
  stickerRemove: "Remove",
  stickerRemoveAll: "Remove all",
  stickerDelete: "Delete from drawer",
  stickerName: { clover: "Clover", star: "Star", coffee: "Coffee" },
  stickerError: (code) => {
    switch (code) {
      case "BAD_FORMAT":
        return "Only PNG, WebP, SVG, or GIF files can be added.";
      case "TOO_LARGE":
        return `The file is too large. The limit is ${STICKER.maxBytes / 1024}KB.`;
      case "DECODE_FAILED":
        return "Could not read the image.";
      case "LIMIT":
        return `You can place up to ${STICKER.maxCount} stickers.`;
      default:
        return code;
    }
  },

  settingsTitle: "Settings",
  soundLabel: "Notification Sound",
  soundDesc: "Number of beeps when a session ends",
  beepCountSuffix: (n) => `${n}×`,
  flashLabel: "Flash",
  flashDesc: "Dial flashes brightly with the sound",
  miniModeLabel: "Mini Mode",
  miniModeDesc: "Shrink to the top-right corner, always on top",
  exitMiniMode: "Exit mini mode",
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
    dev: "Development",
    language: "Language",
    coding: "Coding",
    reading: "Reading / Papers",
    tutorial: "Tutorial",
    "side-project": "Side Project",
    review: "Review",
    certificate: "Certificate",
    career: "Career",
  },
};

export const MESSAGES: Record<Lang, Messages> = { ko, en };

/**
 * 태그 표시명.
 * - ko: 항상 label
 * - en: 사용자가 만든 태그는 label_en, 시드 태그(label_en = null)는 i18n 사전
 *
 * label_en을 사전보다 먼저 보는 이유: 사용자가 시드 태그와 같은 key로 슬러그되는
 * 이름(예: 공부 모드의 "Meeting")을 만들어도 엉뚱한 사전 값을 집어오지 않게 하려고.
 */
export function resolveTagLabel(
  tag: { key: string; label: string; label_en?: string | null },
  lang: Lang,
  dict: Record<string, string>,
): string {
  if (lang === "ko") return tag.label;
  return tag.label_en ?? dict[tag.key] ?? tag.label;
}

/** 짧은 날짜 라벨 — "5/14" / "May 14" */
export function formatDateShort(date: Date, lang: Lang): string {
  if (lang === "ko") {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
