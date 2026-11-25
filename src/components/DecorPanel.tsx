import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/lang";
import {
  STICKER,
  STICKER_ACCEPT,
  StickerError,
  type Placement,
  type StickerItem,
} from "../lib/stickers";
import { THEMES, themeLabel, type Theme } from "./TimerDisplay";

const THEME_ORDER: Theme[] = [
  "moran",
  "sunfish",
  "pepe",
  "rocky",
  "pointNemo",
  "burjKhalifa",
];

interface Props {
  theme: Theme;
  onChangeTheme: (t: Theme) => void;
  items: StickerItem[];
  placedCount: number;
  /** 본체에서 고른 스티커 (없으면 null) */
  selected: Placement | null;
  /** 서랍의 스티커를 본체에 붙인다. 규칙에 걸리면 StickerError 를 던진다. */
  onPlace: (ref: string) => void;
  /** 파일을 서랍에 등록한다. 등록되면 바로 본체에도 붙인다. */
  onRegister: (file: File) => Promise<void>;
  /** 등록한 스티커를 서랍에서 지운다 */
  onUnregister: (userId: number) => Promise<void>;
  onResize: (size: number) => void;
  onRotate: (rot: number) => void;
  onRemove: () => void;
  onRemoveAll: () => void;
  onClose: () => void;
}

/**
 * 꾸미기 서랍 — 테마 색 고르기 + 스티커.
 * 시계 옆에 떠서, 열려 있는 동안 본체의 스티커를 끌어 옮길 수 있다.
 */
export function DecorPanel({
  theme,
  onChangeTheme,
  items,
  placedCount,
  selected,
  onPlace,
  onRegister,
  onUnregister,
  onResize,
  onRotate,
  onRemove,
  onRemoveAll,
  onClose,
}: Props) {
  const { t, lang } = useLang();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function showError(e: unknown) {
    if (e instanceof StickerError) setError(t.stickerError(e.code));
    else setError(e instanceof Error ? e.message : String(e));
  }

  function handlePlace(ref: string) {
    try {
      onPlace(ref);
      setError(null);
    } catch (e) {
      showError(e);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await onRegister(file);
      setError(null);
    } catch (err) {
      showError(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnregister(userId: number) {
    try {
      await onUnregister(userId);
      setError(null);
    } catch (e) {
      showError(e);
    }
  }

  const smallBtn =
    "px-2 py-1 text-xs rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-50";

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-[140px] max-h-full overflow-y-auto rounded-xl bg-white border border-zinc-200 shadow-lg p-2.5 text-zinc-700">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-zinc-800">
          {t.decorLabel}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.doneClose}
          title={t.doneClose}
          className="w-5 h-5 leading-none rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
        >
          ×
        </button>
      </div>

      <div className="mt-2 flex items-baseline justify-between text-[11px]">
        <span className="text-zinc-500">{t.themeLabel}</span>
        <span className="font-medium text-zinc-700">
          {themeLabel(theme, lang)}
        </span>
      </div>
      <div className="mt-1.5 px-0.5 flex justify-between">
        {THEME_ORDER.map((th) => {
          const active = th === theme;
          return (
            <button
              key={th}
              type="button"
              onClick={() => onChangeTheme(th)}
              aria-label={themeLabel(th, lang)}
              aria-pressed={active}
              title={themeLabel(th, lang)}
              className={
                "w-4 h-4 rounded-full border transition-shadow " +
                (active
                  ? "border-transparent ring-2 ring-offset-1 ring-zinc-700"
                  : "border-zinc-300 hover:border-zinc-500")
              }
              style={{ backgroundColor: THEMES[th].frame }}
            />
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-zinc-200 text-[11px] text-zinc-500">
        {t.stickerLabel}
      </div>
      <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">
        {t.stickerPickHint}
      </p>

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {items.map((it) => (
          <div key={it.ref} className="relative group">
            <button
              type="button"
              onClick={() => handlePlace(it.ref)}
              title={it.name}
              className="w-full aspect-square p-1 rounded-lg border border-zinc-200 bg-white hover:border-zinc-500 transition-colors"
            >
              <img
                src={it.src}
                alt={it.name}
                draggable={false}
                className="w-full h-full object-contain"
              />
            </button>
            {it.userId != null && (
              <button
                type="button"
                onClick={() => handleUnregister(it.userId!)}
                aria-label={t.stickerDelete}
                title={t.stickerDelete}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-700 text-white text-[10px] leading-none hidden group-hover:block hover:bg-red-600"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className={smallBtn + " mt-2 w-full"}
      >
        {t.stickerAdd}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={STICKER_ACCEPT}
        hidden
        onChange={handleFile}
      />
      <p className="mt-1 text-[10px] leading-snug text-zinc-400">
        {t.stickerFormatHint}
      </p>
      {error && (
        <p className="mt-1 text-[11px] leading-snug text-red-600 break-words">
          {error}
        </p>
      )}

      <div className="mt-2 pt-2 border-t border-zinc-200">
        <div className="text-[11px] text-zinc-500 tabular-nums">
          {t.stickerCount(placedCount, STICKER.maxCount)}
        </div>
        {selected && (
          <div className="mt-1.5 space-y-1">
            <label className="block text-[11px] text-zinc-600">
              <span className="flex justify-between tabular-nums">
                <span>{t.stickerSize}</span>
                <span>{selected.size}px</span>
              </span>
              <input
                type="range"
                className="w-full"
                min={STICKER.minSize}
                max={STICKER.maxSize}
                step={2}
                value={selected.size}
                onChange={(e) => onResize(Number(e.target.value))}
              />
            </label>
            <label className="block text-[11px] text-zinc-600">
              <span className="flex justify-between tabular-nums">
                <span>{t.stickerRotate}</span>
                <span>{selected.rot}°</span>
              </span>
              <input
                type="range"
                className="w-full"
                min={-STICKER.maxRotate}
                max={STICKER.maxRotate}
                step={1}
                value={selected.rot}
                onChange={(e) => onRotate(Number(e.target.value))}
              />
            </label>
          </div>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selected && (
            <button type="button" onClick={onRemove} className={smallBtn}>
              {t.stickerRemove}
            </button>
          )}
          <button
            type="button"
            disabled={placedCount === 0}
            onClick={onRemoveAll}
            className={smallBtn}
          >
            {t.stickerRemoveAll}
          </button>
        </div>
      </div>
    </div>
  );
}
