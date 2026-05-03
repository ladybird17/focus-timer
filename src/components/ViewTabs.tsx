import type { View } from "../App";

interface Props {
  view: View;
  onChangeView: (v: View) => void;
}

export function ViewTabs({ view, onChangeView }: Props) {
  return (
    <div className="inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
      {(["timer", "today"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChangeView(v)}
          className={
            "px-3 py-1 rounded text-sm font-medium transition-colors " +
            (view === v
              ? "bg-zinc-800 text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900")
          }
        >
          {v === "timer" ? "타이머" : "오늘"}
        </button>
      ))}
    </div>
  );
}
