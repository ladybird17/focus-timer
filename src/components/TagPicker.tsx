import type { Tag } from "../types";

interface Props {
  tags: Tag[];
  activeId: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}

export function TagPicker({ tags, activeId, onChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const active = t.id === activeId;
        const color = t.color ?? "#71717a";
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(t.id)}
            style={
              active
                ? { backgroundColor: color, borderColor: color }
                : { borderColor: color + "55", color: color }
            }
            className={
              "px-3 py-1.5 text-sm rounded-full border transition-colors " +
              (active
                ? "text-white"
                : "bg-white hover:bg-zinc-50 disabled:opacity-50")
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
