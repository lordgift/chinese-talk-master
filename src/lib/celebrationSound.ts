import { getSavedVoiceSettings } from '@/hooks/useSpeechSynthesis';

/**
 * Celebration sound effects synthesized with the Web Audio API (no audio assets needed).
 * - 'correct': short bright two-note chime for a single correct answer
 * - 'complete': rising fanfare + chord for finishing a quiz / lesson
 */
export type CelebrationSound = 'correct' | 'complete';

type AudioContextCtor = typeof AudioContext;

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor: AudioContextCtor | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
};

// Browsers (esp. iOS Safari) only allow audio after a user gesture. Some celebrations fire from
// timers (e.g. after speech recognition ends), so unlock the context on the first tap/keypress.
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

const playTone = (
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  peak: number
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);

  // Quick attack, exponential decay — a soft bell-like envelope
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
};

/**
 * Play a celebration sound effect alongside the confetti
 */
export const playCelebrationSound = (variant: CelebrationSound = 'correct') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Follow the user's volume preference from voice settings
    const master = ctx.createGain();
    master.gain.value = 0.35 * getSavedVoiceSettings().volume;
    master.connect(ctx.destination);

    const now = ctx.currentTime + 0.02;

    if (variant === 'correct') {
      // C6 → G6 chime with a soft sine shimmer an octave up
      playTone(ctx, master, 1046.5, now, 0.25, 'triangle', 0.6);
      playTone(ctx, master, 1568.0, now + 0.1, 0.4, 'triangle', 0.6);
      playTone(ctx, master, 3136.0, now + 0.1, 0.3, 'sine', 0.12);
      return;
    }

    // 'complete': rising C-major arpeggio, then a sustained chord with sparkles
    const arpeggio = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    arpeggio.forEach((freq, i) => {
      playTone(ctx, master, freq, now + i * 0.09, 0.3, 'triangle', 0.5);
    });

    const chordAt = now + arpeggio.length * 0.09 + 0.05;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      playTone(ctx, master, freq, chordAt, 1.1, 'triangle', 0.28);
    });

    // Sparkles to match the confetti burst
    [2093.0, 2637.0, 3136.0, 2637.0, 3520.0].forEach((freq, i) => {
      playTone(ctx, master, freq, chordAt + 0.05 + i * 0.07, 0.25, 'sine', 0.1);
    });
  } catch (err) {
    console.warn('Celebration sound error:', err);
  }
};
