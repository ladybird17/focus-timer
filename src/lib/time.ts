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
