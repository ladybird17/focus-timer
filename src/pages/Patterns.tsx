import { useEffect, useMemo, useState } from "react";
import { ViewTabs } from "../components/ViewTabs";
import { Heatmap } from "../components/charts/Heatmap";
import type { View } from "../App";
import { getSessionsBetween, type SessionRow } from "../lib/stats";
import { useLang } from "../lib/lang";
import { formatDateShort } from "../lib/i18n";

type RangeKey = "week" | "month";

interface Props {
  view: View;
  onChangeView: (v: View) => void;
}

export default function Patterns({ view, onChangeView }: Props) {
  const { lang, t } = useLang();
  const [range, setRange] = useState<RangeKey>("week");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fromIso, toIso, fromDate, toDate } = useMemo(() => {
    const now = new Date();
    const days = range === "week" ? 7 : 30;
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    return {
      fromIso: from.toISOString(),
      toIso: now.toISOString(),
      fromDate: from,
      toDate: now,
    };
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const rows = await getSessionsBetween(fromIso, toIso);
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
  }, [fromIso, toIso]);

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: "week", label: t.patternsRangeWeek },
    { key: "month", label: t.patternsRangeMonth },
  ];

  const rangeLabel = t.patternsRangeSuffix(
    formatDateShort(fromDate, lang),
    formatDateShort(toDate, lang),
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#fffef7] text-zinc-800">
      <header className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-zinc-700">
            {t.tabPatterns}
          </h1>
          <div className="text-xs text-zinc-500 mt-0.5">{rangeLabel}</div>
        </div>
        <ViewTabs view={view} onChangeView={onChangeView} />
      </header>

      <section className="px-6 pb-2">
        <div className="inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={
                "px-3 py-1 rounded text-sm font-medium transition-colors " +
                (range === r.key
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pt-6 pb-8">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          {t.sectionInterruptHeatmap}
        </h2>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <Heatmap sessions={sessions} />
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
