import { useState } from "react";
import { useLang } from "../lib/lang";
import type { Lang } from "../lib/i18n";

interface Props {
  open: boolean;
  beepCount: 1 | 3;
  onChangeBeepCount: (n: 1 | 3) => void;
  flashEnabled: boolean;
  onChangeFlashEnabled: (v: boolean) => void;
  miniMode: boolean;
  onChangeMiniMode: (v: boolean) => void;
  dayStartHour: number;
  onChangeDayStartHour: (h: number) => void;
  onResetToday: () => Promise<number>;
  onClose: () => void;
}

export function SettingsModal({
  open,
  beepCount,
  onChangeBeepCount,
  flashEnabled,
  onChangeFlashEnabled,
  miniMode,
  onChangeMiniMode,
  dayStartHour,
  onChangeDayStartHour,
  onResetToday,
  onClose,
}: Props) {
  const { lang, setLang, t } = useLang();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  if (!open) return null;

  function close() {
    setConfirmReset(false);
    setResetMsg(null);
    onClose();
  }

  async function handleReset() {
    setResetting(true);
    try {
      const n = await onResetToday();
      setResetMsg(t.resetDoneMsg(n));
      setConfirmReset(false);
    } catch (e) {
      setResetMsg(
        e instanceof Error ? t.resetErrorMsg(e.message) : t.resetErrorGeneric,
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={close}
    >
      <div
        className="w-[380px] rounded-xl bg-white border border-zinc-200 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">{t.settingsTitle}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="close"
            className="text-zinc-400 hover:text-zinc-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <div className="text-sm font-medium text-zinc-800">{t.langLabel}</div>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
              {(["ko", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={
                    "px-3 py-1 rounded text-sm font-medium transition-colors " +
                    (lang === l
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900")
                  }
                >
                  {l === "ko" ? t.langKo : t.langEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-800">{t.soundLabel}</div>
            <p className="text-xs text-zinc-500 mt-0.5">{t.soundDesc}</p>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
              {([1, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChangeBeepCount(n)}
                  className={
                    "px-3 py-1 rounded text-sm font-medium transition-colors " +
                    (beepCount === n
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900")
                  }
                >
                  {t.beepCountSuffix(n)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-800">{t.flashLabel}</div>
            <p className="text-xs text-zinc-500 mt-0.5">{t.flashDesc}</p>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
              <button
                type="button"
                onClick={() => onChangeFlashEnabled(false)}
                className={
                  "px-3 py-1 rounded text-sm font-medium transition-colors " +
                  (!flashEnabled
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900")
                }
              >
                {t.off}
              </button>
              <button
                type="button"
                onClick={() => onChangeFlashEnabled(true)}
                className={
                  "px-3 py-1 rounded text-sm font-medium transition-colors " +
                  (flashEnabled
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900")
                }
              >
                {t.on}
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-800">{t.miniModeLabel}</div>
            <p className="text-xs text-zinc-500 mt-0.5">{t.miniModeDesc}</p>
            <div className="mt-2 inline-flex rounded-md bg-zinc-100 border border-zinc-200 p-0.5">
              <button
                type="button"
                onClick={() => onChangeMiniMode(false)}
                className={
                  "px-3 py-1 rounded text-sm font-medium transition-colors " +
                  (!miniMode
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900")
                }
              >
                {t.off}
              </button>
              <button
                type="button"
                onClick={() => onChangeMiniMode(true)}
                className={
                  "px-3 py-1 rounded text-sm font-medium transition-colors " +
                  (miniMode
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900")
                }
              >
                {t.on}
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-zinc-800">{t.dayStartLabel}</div>
            <p className="text-xs text-zinc-500 mt-0.5">{t.dayStartDesc}</p>
            <div className="mt-2 flex items-center gap-2">
              <select
                value={dayStartHour}
                onChange={(e) => onChangeDayStartHour(Number(e.target.value))}
                className="px-2.5 py-1 text-sm rounded-md border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">{t.dayStartUnit}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200">
            <div className="text-sm font-medium text-zinc-800">{t.dataLabel}</div>
            <p className="text-xs text-zinc-500 mt-0.5">{t.resetTodayDesc}</p>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => {
                  setResetMsg(null);
                  setConfirmReset(true);
                }}
                className="mt-2 px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
              >
                {t.resetTodayBtn}
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-zinc-700">{t.resetConfirm}</span>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  disabled={resetting}
                  className="px-3 py-1 text-sm rounded-md bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {resetting ? t.resetting : t.deleteWord}
                </button>
              </div>
            )}
            {resetMsg && (
              <p className="mt-2 text-xs text-zinc-600">{resetMsg}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-zinc-800 text-white hover:bg-zinc-700"
          >
            {t.doneClose}
          </button>
        </div>
      </div>
    </div>
  );
}
