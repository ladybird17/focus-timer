import type { Mode } from "../types";
import { useLang } from "../lib/lang";

interface Props {
  modes: Mode[];
  activeId: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}

export function ModeToggle({ modes, activeId, onChange, disabled }: Props) {
  const { lang, t } = useLang();
  return (
    <div className="inline-flex rounded-lg bg-white border border-zinc-200 p-1 shadow-sm">
      {modes.map((m) => {
        const active = m.id === activeId;
        const label = lang === "en" ? t.mode[m.key] : m.label;
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors " +
              (active
                ? "bg-zinc-800 text-white"
                : "text-zinc-600 hover:text-zinc-900 disabled:opacity-50")
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
