import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { TagSlice } from "../../lib/stats";
import { formatDuration } from "../../lib/time";
import { useLang } from "../../lib/lang";

interface Props {
  data: TagSlice[];
  centerLabel?: string;
}

export function DonutChart({ data, centerLabel }: Props) {
  const { lang, t } = useLang();
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-zinc-400">
        {t.donutEmpty}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="ms"
              nameKey="tagLabel"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.tagId} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const p = payload[0].payload as TagSlice;
                const display =
                  lang === "en" ? t.tag[p.tagKey] ?? p.tagLabel : p.tagLabel;
                return (
                  <div className="px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 text-xs shadow-lg">
                    <div className="font-medium">{display}</div>
                    <div className="tabular-nums text-zinc-300">
                      {formatDuration(p.ms, t)} · {t.sessionsCount(p.count)}
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] text-zinc-500">{t.donutCenterLabel}</div>
            <div className="text-base font-semibold text-zinc-800 tabular-nums">
              {centerLabel}
            </div>
          </div>
        )}
      </div>
      <ul className="flex-1 space-y-1.5 text-sm">
        {data.map((d) => {
          const display =
            lang === "en" ? t.tag[d.tagKey] ?? d.tagLabel : d.tagLabel;
          return (
            <li key={d.tagId} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-zinc-700 truncate">{display}</span>
              <span className="ml-auto text-zinc-500 tabular-nums whitespace-nowrap">
                {formatDuration(d.ms, t)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
