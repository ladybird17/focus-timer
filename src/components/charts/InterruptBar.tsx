import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { InterruptSlice } from "../../lib/stats";
import { useLang } from "../../lib/lang";

interface Props {
  data: InterruptSlice[];
}

const PALETTE = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#a1a1aa",
  "#71717a",
  "#52525b",
  "#3f3f46",
];

export function InterruptBar({ data }: Props) {
  const { t } = useLang();
  if (data.length === 0) {
    return (
      <div className="h-[80px] flex items-center justify-center text-sm text-zinc-400">
        {t.interruptEmpty}
      </div>
    );
  }

  // 라벨을 i18n으로 매핑한 새 데이터 (Y축/툴팁용)
  const localized = data.map((d) => ({
    ...d,
    label: t.reason[d.reason],
  }));

  return (
    <div style={{ width: "100%", height: 24 + localized.length * 36 }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={localized}
          margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#52525b" }}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#3f3f46" }}
            width={100}
          />
          <Tooltip
            cursor={{ fill: "#f4f4f5" }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const p = payload[0].payload as InterruptSlice & { label: string };
              return (
                <div className="px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-50 text-xs shadow-lg">
                  <div className="font-medium">{p.label}</div>
                  <div className="tabular-nums text-zinc-300">
                    {t.countTimes(p.count)}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {localized.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
