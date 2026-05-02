import { useEffect, useMemo, useRef, useState } from "react";
import { ModeToggle } from "../components/ModeToggle";
import { TagPicker } from "../components/TagPicker";
import { TimerDisplay, THEMES, type Theme } from "../components/TimerDisplay";
import { InterruptModal } from "../components/InterruptModal";
import { ReviewModal } from "../components/ReviewModal";
import { SettingsModal } from "../components/SettingsModal";
import {
  completeSession,
  deleteTodaySessions,
  getRunningSession,
  interruptSession,
  listModes,
  listTags,
  startSession,
} from "../lib/db";
import { remainingMs } from "../lib/time";
import { ensureNotificationPermission, notifySessionDone } from "../lib/notify";
import { playBeepSequence } from "../lib/sound";
import {
  PRESETS_MIN,
  interruptReasonsFor,
  type InterruptReason,
  type Mode,
  type ModeKey,
  type SelfReview,
  type Session,
  type Tag,
} from "../types";

interface Running {
  sessionId: number;
  startedAt: string;
  plannedMin: number;
  tagLabel: string;
}

const THEME_STORAGE_KEY = "focus-timer.theme";
const BEEPS_STORAGE_KEY = "focus-timer.beepCount";
const FLASH_STORAGE_KEY = "focus-timer.flash";

type BeepCount = 1 | 3;

export default function Timer() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [modeId, setModeId] = useState<number | null>(null);
  const [tagId, setTagId] = useState<number | null>(null);
  const [plannedMin, setPlannedMin] = useState<number>(60);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "sky" || saved === "ivory" || saved === "butter") return saved;
    return "butter";
  });
  const [beepCount, setBeepCount] = useState<BeepCount>(() => {
    return localStorage.getItem(BEEPS_STORAGE_KEY) === "3" ? 3 : 1;
  });
  const [flashEnabled, setFlashEnabled] = useState<boolean>(() => {
    return localStorage.getItem(FLASH_STORAGE_KEY) === "1";
  });
  const [flashOn, setFlashOn] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [running, setRunning] = useState<Running | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [showInterrupt, setShowInterrupt] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notifiedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(BEEPS_STORAGE_KEY, String(beepCount));
  }, [beepCount]);

  useEffect(() => {
    localStorage.setItem(FLASH_STORAGE_KEY, flashEnabled ? "1" : "0");
  }, [flashEnabled]);

  useEffect(() => {
    (async () => {
      try {
        const ms = await listModes();
        setModes(ms);
        if (ms.length > 0) setModeId(ms[0].id);

        const existing = await getRunningSession();
        if (existing) {
          await restoreRunning(existing);
        }
        await ensureNotificationPermission();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  useEffect(() => {
    if (modeId == null) return;
    if (running) return;
    (async () => {
      const ts = await listTags(modeId);
      setTags(ts);
      setTagId(ts[0]?.id ?? null);
    })();
  }, [modeId, running]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const remain = remainingMs(running.startedAt, running.plannedMin, now);
    if (remain <= 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      void notifySessionDone(running.tagLabel);
      void playBeepSequence(beepCount, {
        onBeepStart: flashEnabled ? () => setFlashOn(true) : undefined,
        onBeepEnd: flashEnabled ? () => setFlashOn(false) : undefined,
      }).finally(() => setFlashOn(false));
      setShowReview(true);
    }
  }, [now, running, beepCount, flashEnabled]);

  async function restoreRunning(session: Session) {
    const tagsForMode = await listTags(session.mode_id);
    const tag = tagsForMode.find((t) => t.id === session.tag_id);
    setModeId(session.mode_id);
    setTags(tagsForMode);
    setTagId(session.tag_id);
    setPlannedMin(session.planned_min);
    setRunning({
      sessionId: session.id,
      startedAt: session.started_at,
      plannedMin: session.planned_min,
      tagLabel: tag?.label ?? "세션",
    });
    setNow(Date.now());
    notifiedRef.current = false;
  }

  async function handleStart() {
    if (modeId == null || tagId == null) return;
    try {
      const id = await startSession({ modeId, tagId, plannedMin });
      const tag = tags.find((t) => t.id === tagId);
      setRunning({
        sessionId: id,
        startedAt: new Date().toISOString(),
        plannedMin,
        tagLabel: tag?.label ?? "세션",
      });
      setNow(Date.now());
      notifiedRef.current = false;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleCompleteClick() {
    if (!running) return;
    setShowReview(true);
  }

  async function handleReviewSelect(review: SelfReview) {
    if (!running) return;
    try {
      await completeSession(running.sessionId, review);
      setRunning(null);
      setShowReview(false);
      notifiedRef.current = false;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleInterruptClick() {
    if (!running) return;
    setShowInterrupt(true);
  }

  async function handleResetToday(): Promise<number> {
    const n = await deleteTodaySessions();
    setRunning(null);
    setShowReview(false);
    setShowInterrupt(false);
    setFlashOn(false);
    notifiedRef.current = false;
    return n;
  }

  async function handleInterruptSelect(reason: InterruptReason) {
    if (!running) return;
    try {
      await interruptSession(running.sessionId, reason);
      setRunning(null);
      setShowInterrupt(false);
      notifiedRef.current = false;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const dialFraction = useMemo(() => {
    if (running) {
      const remain = remainingMs(running.startedAt, running.plannedMin, now);
      if (remain >= 0) return remain / 60000 / 60;
      return 0;
    }
    return plannedMin / 60;
  }, [running, now, plannedMin]);

  const canStart = modeId != null && tagId != null && !running;

  const currentModeKey: ModeKey =
    (modes.find((m) => m.id === modeId)?.key as ModeKey) ?? "work";
  const reasons = interruptReasonsFor(currentModeKey);

  const accent = THEMES[theme].text;
  const ACCENT_HOVER: Record<Theme, string> = {
    butter: "#1a3478",
    sky: "#b8201d",
    ivory: "#2f4a2b",
  };
  const accentHover = ACCENT_HOVER[theme];

  const todayLabel = useMemo(() => {
    const d = new Date();
    const dateStr = d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const wd = d.toLocaleDateString("ko-KR", { weekday: "short" });
    return `${dateStr} (${wd})`;
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-[#fffef7] text-zinc-800">
      <header className="px-6 pt-5 pb-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-zinc-700">{todayLabel}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {(["butter", "sky", "ivory"] as Theme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-label={`${t} theme`}
                className={
                  "w-5 h-5 rounded-full border " +
                  (theme === t
                    ? "border-zinc-700 ring-2 ring-zinc-300"
                    : "border-zinc-400 opacity-60 hover:opacity-100")
                }
                style={{ backgroundColor: THEMES[t].frame }}
              />
            ))}
          </div>
          <ModeToggle
            modes={modes}
            activeId={modeId}
            onChange={setModeId}
            disabled={!!running}
          />
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="settings"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <section className="px-6 pt-2">
        <TagPicker
          tags={tags}
          activeId={tagId}
          onChange={setTagId}
          disabled={!!running}
        />
      </section>

      <section className="px-6 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS_MIN.map((m) => {
            const active = plannedMin === m;
            return (
              <button
                key={m}
                type="button"
                disabled={!!running}
                onClick={() => setPlannedMin(m)}
                className={
                  "px-3 py-1 text-sm rounded-md transition-colors " +
                  (active
                    ? "bg-zinc-800 text-zinc-50"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 disabled:opacity-50")
                }
              >
                {m}분
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center px-6">
        <TimerDisplay
          dialFraction={dialFraction}
          theme={theme}
          flash={flashOn}
        />
      </section>

      <section className="px-6 pb-8">
        {!running ? (
          <button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="w-full py-3 text-base font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={
              {
                backgroundColor: canStart ? accent : "#a1a1aa",
                ["--hover-bg" as string]: accentHover,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              if (canStart) e.currentTarget.style.backgroundColor = accentHover;
            }}
            onMouseLeave={(e) => {
              if (canStart) e.currentTarget.style.backgroundColor = accent;
            }}
          >
            시작
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCompleteClick}
              className="py-3 text-base font-semibold rounded-xl text-white transition-colors"
              style={{ backgroundColor: accent }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = accentHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = accent)
              }
            >
              완료
            </button>
            <button
              type="button"
              onClick={handleInterruptClick}
              className="py-3 text-base font-semibold rounded-xl bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100"
            >
              중단
            </button>
          </div>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-600 break-all">{error}</p>
        )}
      </section>

      <InterruptModal
        open={showInterrupt}
        reasons={reasons}
        onSelect={handleInterruptSelect}
        onCancel={() => setShowInterrupt(false)}
      />
      <ReviewModal open={showReview} onSelect={handleReviewSelect} />
      <SettingsModal
        open={showSettings}
        beepCount={beepCount}
        onChangeBeepCount={setBeepCount}
        flashEnabled={flashEnabled}
        onChangeFlashEnabled={setFlashEnabled}
        onResetToday={handleResetToday}
        onClose={() => setShowSettings(false)}
      />
    </main>
  );
}
