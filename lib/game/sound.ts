"use client";
// Tiny chiptune SFX synthesised with WebAudio — no audio files.
import { game } from "./state";

let ctx: AudioContext | null = null;
let gestured = false;

/** Browsers only allow audio after a user gesture. Never create the context before one
 *  (a context made on hover starts locked and some browsers never let it resume). */
function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const activated = gestured || (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
    if (!activated) return null;
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  // "suspended" (Chrome/Firefox) or "interrupted" (Safari) — anything but running needs a resume
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  return ctx;
}

function prime() {
  gestured = true;
  const a = ac();
  if (!a) return;
  // iOS needs something actually played inside the gesture to fully unlock output
  const src = a.createBufferSource();
  src.buffer = a.createBuffer(1, 1, 22050);
  src.connect(a.destination);
  src.start(0);
}

if (typeof window !== "undefined") {
  const opts = { capture: true, passive: true } as const;
  const handler = () => {
    prime();
    if (ctx?.state === "running") ["pointerdown", "keydown", "touchend"].forEach((ev) => window.removeEventListener(ev, handler, opts));
  };
  ["pointerdown", "keydown", "touchend"].forEach((ev) => window.addEventListener(ev, handler, opts));
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.05, slideTo?: number, retry = true) {
  const a = ac();
  if (!a) return;
  // if the context is still waking up, play as soon as it's running instead of scheduling into a frozen clock
  if (a.state !== "running") {
    if (retry) a.resume().then(() => tone(freq, start, dur, type, vol, slideTo, false)).catch(() => {});
    return;
  }
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const on = () => game.settings.get().sound;

export const sfx = {
  tick() { if (on()) tone(1046, 0, 0.045, "square", 0.025); },
  select() { if (on()) { tone(659, 0, 0.07, "square", 0.04); tone(988, 0.06, 0.1, "square", 0.04); } },
  back() { if (on()) { tone(784, 0, 0.07, "square", 0.035); tone(523, 0.06, 0.1, "square", 0.035); } },
  grab() { if (on()) tone(330, 0, 0.12, "triangle", 0.06, 520); },
  drop() { if (on()) tone(520, 0, 0.12, "triangle", 0.05, 300); },
  pop() { if (on()) tone(880, 0, 0.08, "sine", 0.06, 1400); },
  star() {
    if (!on()) return;
    [1318, 1568, 1976, 2637].forEach((f, i) => tone(f, i * 0.05, 0.18, "sine", 0.045));
  },
  achievement() {
    if (!on()) return;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.16, "square", 0.04));
    tone(1568, 0.34, 0.35, "triangle", 0.05);
  },
  /** call from a user gesture to unlock audio on iOS */
  unlock() { prime(); },
};
