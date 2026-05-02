type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio API not supported");
    ctx = new Ctor();
  }
  return ctx;
}

function playOne(
  durationMs: number,
  freq: number,
  volume: number,
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const now = c.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000);
      osc.onended = () => resolve();
    } catch {
      resolve();
    }
  });
}

export interface BeepHooks {
  onBeepStart?: () => void;
  onBeepEnd?: () => void;
}

export async function playBeepSequence(
  count: number,
  hooks: BeepHooks = {},
): Promise<void> {
  const beepMs = 250;
  const gapMs = 180;
  for (let i = 0; i < count; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, gapMs));
    hooks.onBeepStart?.();
    await playOne(beepMs, 880, 0.25);
    hooks.onBeepEnd?.();
  }
}
