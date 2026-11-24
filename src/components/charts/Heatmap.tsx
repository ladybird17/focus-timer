import { Fragment, useState } from "react";
import { useLang } from "../../lib/lang";
import { interruptHeatmap, type SessionRow } from "../../lib/stats";

interface Props {
  sessions: SessionRow[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_TICKS = new Set([0, 6, 12, 18]);

function cellColor(count: number, max: number): string {
  if (count === 0 || max === 0) return "#f4f4f5"; // zinc-100
  const intensity = count / max;
  const alpha = 0.2 + intensity * 0.8;
  return `rgba(220, 38, 38, ${alpha})`; // red-600 알파
}

export function Heatmap({ sessions }: Props) {
  const { t } = useLang();
  const [hover, setHover] = useState<{
    dow: number;
    hour: number;
    count: number;
  } | null>(null);

  const grid = interruptHeatmap(sessions);
  let max = 0;
  for (const row of grid) for (const v of row) if (v > max) max = v;

  if (max === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-sm text-zinc-400">
        {t.heatmapEmpty}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "auto repeat(24, minmax(0, 1fr))",
          gap: 2,
        }}
      >
        <div />
        {HOURS.map((h) => (
          <div
            key={`h-${h}`}
            className="text-[10px] text-zinc-400 text-center leading-4"
          >
            {HOUR_TICKS.has(h) ? h : ""}
          </div>
        ))}

        {t.dowShort.map((dowLabel, dow) => (
          <Fragment key={`row-${dow}`}>
            <div className="text-[11px] text-zinc-500 pr-2 flex items-center justify-end">
              {dowLabel}
            </div>
            {HOURS.map((h) => {
              const count = grid[dow][h];
              return (
                <div
                  key={`c-${dow}-${h}`}
                  className="rounded-sm cursor-default"
                  style={{
                    aspectRatio: "1 / 1",
                    minWidth: 12,
                    backgroundColor: cellColor(count, max),
                  }}
                  onMouseEnter={() => setHover({ dow, hour: h, count })}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      {hover && (
        <div className="absolute top-0 right-0 px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 text-xs shadow-lg pointer-events-none">
          {t.heatmapTooltip(t.dowShort[hover.dow], hover.hour, hover.count)}
        </div>
      )}
    </div>
  );
}
