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

interface Props {
  sessions: SessionRow[];
}

interface BarDatum {
  label: string;
  offset: number;
  duration: number;
  color: string;
  tagLabel: string;
  status: SessionRow["status"];
  startedAt: string;
  endedAt: string | null;
}

const FALLBACK_COLOR = "#a1a1aa";

export function Timeline({ sessions }: Props) {
  const range = timelineRange(sessions);
  if (!range || sessions.length === 0) {
    return (
      <div className="h-[80px] flex items-center justify-center text-sm text-zinc-400">
        세션이 없습니다
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
      tagLabel: s.tag_label,
      status: s.status,
      startedAt: s.started_at,
      endedAt: s.ended_at,
    };
  });

  const tickInterval = totalMs > 6 * 3_600_000 ? 3_600_000 : 30 * 60_000;
  const ticks: number[] = [];
  let t = Math.ceil(fromMs / tickInterval) * tickInterval;
  while (t <= toMs + tickInterval) {
    ticks.push(t - fromMs);
    t += tickInterval;
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
              const status = d.status === "completed" ? "완료" : "중단";
              const range = `${formatHm(new Date(d.startedAt))} ~ ${
                d.endedAt ? formatHm(new Date(d.endedAt)) : "?"
              }`;
              return (
                <div className="px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 text-xs shadow-lg">
                  <div className="font-medium">
                    {d.tagLabel} · {status}
                  </div>
                  <div className="tabular-nums text-zinc-300">
                    {range} ({formatDuration(d.duration)})
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
