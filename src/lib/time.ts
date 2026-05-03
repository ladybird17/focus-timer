export function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function elapsedMs(startIso: string, now = Date.now()): number {
  return now - new Date(startIso).getTime();
}

export function remainingMs(
  startIso: string,
  plannedMin: number,
  now = Date.now(),
): number {
  return plannedMin * 60 * 1000 - elapsedMs(startIso, now);
}

/** 'HH:mm' 표시 — 로컬 타임존 기준 */
export function formatHm(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** ms를 사람이 읽는 시간으로 — 언어별 포맷은 messages 함수에 위임 */
export function formatDuration(
  ms: number,
  t: { durationMinOnly: (m: number) => string; durationHourMin: (h: number, m: number) => string },
): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return t.durationMinOnly(m);
  return t.durationHourMin(h, m);
}
