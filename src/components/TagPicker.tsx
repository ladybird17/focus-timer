import type { Tag } from "../types";
import { useLang } from "../lib/lang";

interface Props {
  tags: Tag[];
  activeId: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}

export function TagPicker({ tags, activeId, onChange, disabled }: Props) {
  const { lang, t } = useLang();
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = tag.id === activeId;
        const color = tag.color ?? "#71717a";
        const label = lang === "en" ? t.tag[tag.key] ?? tag.label : tag.label;
        return (
          <button
            key={tag.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tag.id)}
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
            {label}
          </button>
        );
      })}
    </div>
  );
}
