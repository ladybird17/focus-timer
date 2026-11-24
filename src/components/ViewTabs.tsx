import { Fragment } from "react";
import type { View } from "../App";
import { useLang } from "../lib/lang";

interface Props {
  view: View;
  onChangeView: (v: View) => void;
}

export function ViewTabs({ view, onChangeView }: Props) {
  const { t } = useLang();
  const label: Record<View, string> = {
    timer: t.tabTimer,
    today: t.tabToday,
    patterns: t.tabPatterns,
  };
  const tabs: View[] = ["timer", "today", "patterns"];
  return (
    <div className="inline-flex items-stretch rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
      {tabs.map((v, i) => (
        <Fragment key={v}>
          {i === 1 && (
            <span
              aria-hidden
              className="w-px self-stretch bg-zinc-300 mx-0.5 my-1"
            />
          )}
          <button
            type="button"
            onClick={() => onChangeView(v)}
            className={
              "px-3 py-1 rounded text-sm font-medium transition-colors " +
              (view === v
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900")
            }
          >
            {label[v]}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
