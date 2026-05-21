import { useEffect, useMemo, useState } from "react";
import { KpiCard } from "../components/charts/KpiCard";
import { DonutChart } from "../components/charts/DonutChart";
import { Timeline } from "../components/charts/Timeline";
import { InterruptBar } from "../components/charts/InterruptBar";
import { ModeCompare } from "../components/charts/ModeCompare";
import { ViewTabs } from "../components/ViewTabs";
import type { View } from "../App";
import {
  bestStreak,
  completedCount,
  dailyStreak,
  filterByMode,
  getCompletedDays,
  getSessionsBetween,
  interruptDistribution,
  interruptedCount,
  reviewBreakdown,
  tagDistribution,
  todayRange,
  totalFocusMs,
  type ModeFilter,
  type SessionRow,
} from "../lib/stats";
import { formatDuration, formatHm } from "../lib/time";
import { useLang } from "../lib/lang";
import { formatDateLabel } from "../lib/i18n";

interface Props {
  view: View;
  onChangeView: (v: View) => void;
  dayStartHour: number;
}

export default function Today({ view, onChangeView, dayStartHour }: Props) {
  const { lang, t } = useLang();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
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
        const [rows, days] = await Promise.all([
          getSessionsBetween(range.fromIso, range.toIso),
          getCompletedDays(dayStartHour, filter),
        ]);
        if (!cancelled) {
          setSessions(rows);
          setCompletedDays(days);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range.fromIso, range.toIso, dayStartHour, filter]);

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
  const daily = dailyStreak(completedDays, dayStartHour);
  const review = reviewBreakdown(filtered);

  const FILTERS: { key: ModeFilter; label: string }[] = [
    { key: "all", label: t.filterAll },
    { key: "work", label: t.filterWork },
    { key: "study", label: t.filterStudy },
  ];

  const dayLabel = useMemo(
    () => formatDateLabel(new Date(range.fromIso), lang),
    [range.fromIso, lang],
  );

  const streakHint = streak
    ? `${formatHm(new Date(streak.fromIso))} ~ ${formatHm(new Date(streak.toIso))}`
    : "";

  return (
    <main className="min-h-screen flex flex-col bg-[#fffef7] text-zinc-800">
      <header className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-zinc-700">{dayLabel}</h1>
          <div className="text-xs text-zinc-500 mt-0.5">
            {t.todayBaseSuffix(formatHm(new Date(range.fromIso)))}
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
            label={t.kpiTotalFocus}
            value={total > 0 ? formatDuration(total, t) : t.none}
          />
          <KpiCard
            label={t.kpiCompleted}
            value={t.countSuffix(completed)}
            hint={interrupted > 0 ? t.stoppedHint(interrupted) : undefined}
          />
          <KpiCard
            label={t.kpiBestStreak}
            value={streak ? t.streakValue(streak.count) : t.none}
            hint={streakHint || undefined}
          />
          <KpiCard
            label={t.kpiDailyStreak}
            value={daily.count > 0 ? t.daysValue(daily.count) : t.none}
            hint={
              daily.count > 0
                ? daily.updatedToday
                  ? t.dailyStreakUpdatedToday
                  : t.dailyStreakPendingToday
                : undefined
            }
          />
          <KpiCard
            label={t.kpiFocusRate}
            value={
              review.reviewedTotal > 0
                ? t.focusRateValue(review.focusedRate)
                : t.none
            }
            hint={
              review.reviewedTotal > 0
                ? t.reviewHint(review.focused, review.distracted)
                : undefined
            }
          />
        </div>
      </section>

      {filter === "all" && (
        <section className="px-6 pt-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-3">
            {t.sectionModeCompare}
          </h2>
          <div className="p-4 rounded-xl bg-white border border-zinc-200">
            <ModeCompare sessions={sessions} />
          </div>
        </section>
      )}

      <section className="px-6 pt-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          {t.sectionTagDistribution}
        </h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <DonutChart
            data={tags}
            centerLabel={total > 0 ? formatDuration(total, t) : undefined}
          />
        </div>
      </section>

      <section className="px-6 pt-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          {t.sectionTimeline}
        </h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <Timeline sessions={filtered} />
        </div>
      </section>

      <section className="px-6 pt-6 pb-8">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          {t.sectionInterruptReasons}
        </h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <InterruptBar data={interrupts} />
        </div>
      </section>

      {loading && (
        <div className="px-6 pb-4 text-xs text-zinc-400">{t.loading}</div>
      )}
      {error && (
        <div className="px-6 pb-4 text-xs text-red-600 break-all">{error}</div>
      )}
    </main>
  );
}
