import { useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/charts/KpiCard";
import { DonutChart } from "../components/charts/DonutChart";
import { Timeline } from "../components/charts/Timeline";
import { InterruptBar } from "../components/charts/InterruptBar";
import { ViewTabs } from "../components/ViewTabs";
import type { View } from "../App";
import {
  bestStreak,
  completedCount,
  filterByMode,
  getSessionsBetween,
  interruptDistribution,
  interruptedCount,
  tagDistribution,
  todayRange,
  totalFocusMs,
  type ModeFilter,
  type SessionRow,
} from "../lib/stats";
import { formatDuration, formatHm } from "../lib/time";

interface Props {
  view: View;
  onChangeView: (v: View) => void;
  dayStartHour: number;
}

const FILTERS: { key: ModeFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "work", label: "업무" },
  { key: "study", label: "공부" },
];

export default function Today({ view, onChangeView, dayStartHour }: Props) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ModeFilter>("all");

  const range = useMemo(() => todayRange(dayStartHour), [dayStartHour]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const rows = await getSessionsBetween(range.fromIso, range.toIso);
        if (!cancelled) setSessions(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range.fromIso, range.toIso]);

  const filtered = useMemo(
    () => filterByMode(sessions, filter),
    [sessions, filter],
  );

  const total = totalFocusMs(filtered);
  const completed = completedCount(filtered);
  const interrupted = interruptedCount(filtered);
  const streak = bestStreak(filtered);
  const tags = tagDistribution(filtered);
  const interrupts = interruptDistribution(filtered);

  const dayLabel = useMemo(() => {
    const d = new Date(range.fromIso);
    const dateStr = d.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
    const wd = d.toLocaleDateString("ko-KR", { weekday: "short" });
    return `${dateStr} (${wd})`;
  }, [range.fromIso]);

  const streakHint = streak
    ? `${formatHm(new Date(streak.fromIso))} ~ ${formatHm(new Date(streak.toIso))}`
    : "";

  return (
    <main className="min-h-screen flex flex-col bg-[#fffef7] text-zinc-800">
      <header className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-zinc-700">{dayLabel}</h1>
          <div className="text-xs text-zinc-500 mt-0.5">
            {formatHm(new Date(range.fromIso))} 기준
          </div>
        </div>
        <ViewTabs view={view} onChangeView={onChangeView} />
      </header>

      <section className="px-6 pb-2">
        <div className="inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={
                "px-3 py-1 rounded text-sm font-medium transition-colors " +
                (filter === f.key
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pt-3">
        <div className="flex flex-wrap gap-3">
          <KpiCard
            label="총 집중시간"
            value={total > 0 ? formatDuration(total) : "—"}
          />
          <KpiCard
            label="완료 세션"
            value={`${completed}회`}
            hint={interrupted > 0 ? `중단 ${interrupted}회` : undefined}
          />
          <KpiCard
            label="베스트 스트릭"
            value={streak ? `${streak.count}연속` : "—"}
            hint={streakHint || undefined}
          />
        </div>
      </section>

      <section className="px-6 pt-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">태그별 분포</h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <DonutChart
            data={tags}
            centerLabel={total > 0 ? formatDuration(total) : undefined}
          />
        </div>
      </section>

      <section className="px-6 pt-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">타임라인</h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <Timeline sessions={filtered} />
        </div>
      </section>

      <section className="px-6 pt-6 pb-8">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">인터럽트 사유</h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <InterruptBar data={interrupts} />
        </div>
      </section>

      {loading && (
        <div className="px-6 pb-4 text-xs text-zinc-400">불러오는 중…</div>
      )}
      {error && (
        <div className="px-6 pb-4 text-xs text-red-600 break-all">{error}</div>
      )}
    </main>
  );
}
