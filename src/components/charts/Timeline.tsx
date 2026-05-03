import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { durationMs, timelineRange, type SessionRow } from "../../lib/stats";
import { formatHm, formatDuration } from "../../lib/time";
import { useLang } from "../../lib/lang";

interface Props {
  sessions: SessionRow[];
}

interface BarDatum {
  label: string;
  offset: number;
  duration: number;
  color: string;
  tagKey: string;
  tagLabel: string;
  status: SessionRow["status"];
  startedAt: string;
  endedAt: string | null;
}

const FALLBACK_COLOR = "#a1a1aa";

export function Timeline({ sessions }: Props) {
  const { lang, t } = useLang();
  const range = timelineRange(sessions);
  if (!range || sessions.length === 0) {
    return (
      <div className="h-[80px] flex items-center justify-center text-sm text-zinc-400">
        {t.timelineEmpty}
      </div>
    );
  }

  const { fromMs, toMs } = range;
  const totalMs = Math.max(toMs - fromMs, 60_000);

  const data: BarDatum[] = sessions.map((s) => {
    const sMs = new Date(s.started_at).getTime();
    const dur = Math.max(durationMs(s), 60_000);
    return {
      label: formatHm(new Date(s.started_at)),
      offset: sMs - fromMs,
      duration: dur,
      color: s.tag_color ?? FALLBACK_COLOR,
      tagKey: s.tag_key,
      tagLabel: s.tag_label,
      status: s.status,
      startedAt: s.started_at,
      endedAt: s.ended_at,
    };
  });

  const tickInterval = totalMs > 6 * 3_600_000 ? 3_600_000 : 30 * 60_000;
  const ticks: number[] = [];
  let tt = Math.ceil(fromMs / tickInterval) * tickInterval;
  while (tt <= toMs + tickInterval) {
    ticks.push(tt - fromMs);
    tt += tickInterval;
  }

  return (
    <div style={{ width: "100%", height: 48 + data.length * 32 }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          barCategoryGap={6}
        >
          <XAxis
            type="number"
            domain={[0, totalMs]}
            ticks={ticks}
            tickFormatter={(v) => formatHm(new Date(fromMs + Number(v)))}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#52525b" }}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#52525b" }}
            width={50}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const d = payload[0].payload as BarDatum;
              const status =
                d.status === "completed" ? t.statusCompleted : t.statusInterrupted;
              const display =
                lang === "en" ? t.tag[d.tagKey] ?? d.tagLabel : d.tagLabel;
              const range = `${formatHm(new Date(d.startedAt))} ~ ${
                d.endedAt ? formatHm(new Date(d.endedAt)) : "?"
              }`;
              return (
                <div className="px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 text-xs shadow-lg">
                  <div className="font-medium">
                    {display} · {status}
                  </div>
                  <div className="tabular-nums text-zinc-300">
                    {range} ({formatDuration(d.duration, t)})
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="offset" stackId="a" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="duration" stackId="a" radius={3} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.status === "interrupted" ? `${d.color}66` : d.color}
                stroke={d.status === "interrupted" ? "#dc2626" : "none"}
                strokeWidth={d.status === "interrupted" ? 1.5 : 0}
                strokeDasharray={d.status === "interrupted" ? "3 2" : undefined}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
