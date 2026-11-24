import { useEffect, useState } from "react";
import type { Tag } from "../types";
import { MAX_TAGS_PER_MODE, TAG_PALETTE, pickTagColor } from "../types";
import { useLang } from "../lib/lang";
import { resolveTagLabel } from "../lib/i18n";

export interface AddTagInput {
  label: string;
  labelEn: string;
  color: string;
}

interface Props {
  tags: Tag[];
  activeId: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
  /** onAdd / onDelete 둘 다 주고 disabled가 아닐 때만 편집 UI가 뜬다. 실패 시 throw. */
  onAdd?: (input: AddTagInput) => Promise<void>;
  onDelete?: (tagId: number) => Promise<void>;
  /** 에러 코드 → 문구 (기본값: t.tagError) */
  formatError?: (e: unknown) => string;
}

export function TagPicker({
  tags,
  activeId,
  onChange,
  disabled,
  onAdd,
  onDelete,
  formatError,
}: Props) {
  const { lang, t } = useLang();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [color, setColor] = useState<string>(TAG_PALETTE[0]);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = !!onAdd && !!onDelete && !disabled;
  const canAdd = editable && tags.length < MAX_TAGS_PER_MODE;
  const canDelete = editable && tags.length > 1;

  // 모드를 바꾸거나 세션이 시작되면 열려 있던 편집 UI를 닫는다
  useEffect(() => {
    if (!editable) {
      setAdding(false);
      setPendingDelete(null);
      setError(null);
    }
  }, [editable]);

  function describe(e: unknown): string {
    if (formatError) return formatError(e);
    return e instanceof Error ? e.message : String(e);
  }

  function openAdd() {
    setPendingDelete(null);
    setError(null);
    setLabel("");
    setLabelEn("");
    setColor(pickTagColor(tags.map((tg) => tg.color)));
    setAdding(true);
  }

  function closeAdd() {
    setAdding(false);
    setError(null);
  }

  async function submitAdd() {
    if (!onAdd || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onAdd({ label: label.trim(), labelEn: labelEn.trim(), color });
      setAdding(false);
      setLabel("");
      setLabelEn("");
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!onDelete || !pendingDelete || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => {
          const active = tag.id === activeId;
          const tagColor = tag.color ?? "#71717a";
          const text = resolveTagLabel(tag, lang, t.tag);
          const marked = pendingDelete?.id === tag.id;
          return (
            <span key={tag.id} className="relative group inline-flex">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(tag.id)}
                style={
                  active
                    ? { backgroundColor: tagColor, borderColor: tagColor }
                    : { borderColor: tagColor + "55", color: tagColor }
                }
                className={
                  "px-3 py-1.5 text-sm rounded-full border transition-colors " +
                  (active
                    ? "text-white"
                    : "bg-white hover:bg-zinc-50 disabled:opacity-50") +
                  (marked ? " ring-2 ring-red-400 ring-offset-1" : "")
                }
              >
                {text}
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setError(null);
                    setPendingDelete(tag);
                  }}
                  aria-label={t.tagDeleteAria(text)}
                  title={t.tagDeleteBtn}
                  className={
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-600 text-white " +
                    "text-[11px] leading-none flex items-center justify-center " +
                    "hover:bg-red-600 transition-opacity " +
                    (marked
                      ? "opacity-100 bg-red-600"
                      : "opacity-0 group-hover:opacity-100 focus:opacity-100")
                  }
                >
                  ×
                </button>
              )}
            </span>
          );
        })}

        {canAdd && !adding && (
          <button
            type="button"
            onClick={openAdd}
            aria-label={t.tagAddAria}
            title={t.tagAddAria}
            className="px-3 py-1.5 text-sm leading-none rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            +
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <input
              value={label}
              autoFocus
              maxLength={20}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitAdd();
                if (e.key === "Escape") closeAdd();
              }}
              placeholder={t.tagNamePlaceholder}
              className="flex-1 min-w-0 px-2.5 py-1 text-sm rounded-md border border-zinc-300 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <input
              value={labelEn}
              maxLength={24}
              onChange={(e) => setLabelEn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitAdd();
                if (e.key === "Escape") closeAdd();
              }}
              placeholder={t.tagNameEnPlaceholder}
              className="w-36 shrink-0 px-2.5 py-1 text-sm rounded-md border border-zinc-300 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {TAG_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                style={{ backgroundColor: c }}
                className={
                  "w-5 h-5 rounded-full transition-transform " +
                  (color === c
                    ? "ring-2 ring-offset-1 ring-zinc-500 scale-110"
                    : "hover:scale-110")
                }
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 tabular-nums">
              {t.tagCount(tags.length, MAX_TAGS_PER_MODE)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={closeAdd}
                disabled={busy}
                className="px-3 py-1 text-sm rounded-md bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={submitAdd}
                disabled={busy || !label.trim()}
                className="px-3 py-1 text-sm font-medium rounded-md bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {t.tagAddSubmit}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {pendingDelete && (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="text-sm text-zinc-800">
            {t.tagDeleteConfirm(resolveTagLabel(pendingDelete, lang, t.tag))}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">{t.tagDeleteKeepsData}</p>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setPendingDelete(null);
                setError(null);
              }}
              disabled={busy}
              className="px-3 py-1 text-sm rounded-md bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={busy}
              className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
            >
              {t.tagDeleteBtn}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
