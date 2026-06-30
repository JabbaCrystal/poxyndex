// A tiny synthesized "magic" chime — a four-note sparkle arpeggio via Web Audio.
// No audio files, no copyright. Created lazily on a user gesture (autoplay-safe).

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function playMagicChime(): void {
  const ac = audioContext();
  if (!ac) return;
  const now = ac.currentTime;
  const notes = [1046.5, 1318.5, 1568.0, 2093.0]; // C6 · E6 · G6 · C7
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = now + i * 0.06;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}

export const SOUND_KEY = "poxyndex_sound";

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}
