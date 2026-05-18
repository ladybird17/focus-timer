import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/lang";
import { THEMES, THEME_LABELS, type Theme } from "./TimerDisplay";

interface Props {
  theme: Theme;
  onChange: (t: Theme) => void;
}

const THEME_ORDER: Theme[] = [
  "moran",
  "sunfish",
  "pepe",
  "rocky",
  "pointNemo",
  "burjKhalifa",
];

export function ThemePicker({ theme, onChange }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handlePick(next: Theme) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
      >
        <span
          aria-hidden
          className="w-3.5 h-3.5 rounded-full border border-zinc-400"
          style={{ backgroundColor: THEMES[theme].frame }}
        />
        <span className="font-medium text-xs">{THEME_LABELS[theme]}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            "transition-transform " + (open ? "rotate-180" : "rotate-0")
          }
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.themeLabel}
          className="absolute right-0 top-full mt-1.5 w-44 rounded-lg bg-white border border-zinc-200 shadow-lg p-1 z-30"
        >
          {THEME_ORDER.map((th) => {
            const selected = th === theme;
            return (
              <button
                key={th}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handlePick(th)}
                className={
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors " +
                  (selected
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-50")
                }
              >
                <span
                  aria-hidden
                  className="w-4 h-4 rounded-full border border-zinc-300"
                  style={{ backgroundColor: THEMES[th].frame }}
                />
                <span className="flex-1">{THEME_LABELS[th]}</span>
                {selected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
