import {
  completedCount,
  filterByMode,
  interruptedCount,
  reviewBreakdown,
  totalFocusMs,
  type SessionRow,
} from "../../lib/stats";
import { formatDuration } from "../../lib/time";
import { useLang } from "../../lib/lang";
import type { ModeKey } from "../../types";

interface Props {
  sessions: SessionRow[];
}

const MODES: ModeKey[] = ["work", "study"];

const COLORS: Record<ModeKey, string> = {
  work: "#3f3f46", // zinc-700
  study: "#a1a1aa", // zinc-400
};

export function ModeCompare({ sessions }: Props) {
  const { t } = useLang();

  const rows = MODES.map((m) => {
    const ms = filterByMode(sessions, m);
    return {
      key: m,
      total: totalFocusMs(ms),
      completed: completedCount(ms),
      interrupted: interruptedCount(ms),
      review: reviewBreakdown(ms),
    };
  });
  const grandTotal = rows.reduce((acc, r) => acc + r.total, 0);
  const hasAny = rows.some(
    (r) => r.total > 0 || r.completed > 0 || r.interrupted > 0,
  );

  if (!hasAny) {
    return (
      <div className="h-[60px] flex items-center justify-center text-sm text-zinc-400">
        {t.modeCompareEmpty}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = grandTotal > 0 ? (r.total / grandTotal) * 100 : 0;
        const detail: string[] = [];
        detail.push(r.total > 0 ? formatDuration(r.total, t) : t.none);
        detail.push(t.countSuffix(r.completed));
        if (r.interrupted > 0) detail.push(t.stoppedHint(r.interrupted));
        if (r.review.reviewedTotal > 0)
          detail.push(t.focusRateValue(r.review.focusedRate));

        return (
          <div key={r.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[r.key] }}
                />
                <span className="text-sm font-medium text-zinc-700">
                  {t.mode[r.key]}
                </span>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {Math.round(pct)}%
                </span>
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {detail.join(" · ")}
              </span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS[r.key],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
