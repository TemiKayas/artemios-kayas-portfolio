// Time-of-day model: palettes keyed by hour, interpolated continuously.

export type RGB = [number, number, number];

interface Key {
  h: number;
  top: string;
  mid: string;
  bot: string;
  tint: string; // colour the world is washed toward
  tintAmt: number;
  stars: number; // 0..1
}

const KEYS: Key[] = [
  { h: 0, top: "#050818", mid: "#0b1433", bot: "#1b2652", tint: "#0b1233", tintAmt: 0.58, stars: 1 },
  { h: 4.6, top: "#070b22", mid: "#121a40", bot: "#2a2d5c", tint: "#0f1438", tintAmt: 0.55, stars: 0.95 },
  { h: 5.6, top: "#1d2554", mid: "#5b4a82", bot: "#f0907a", tint: "#4a3566", tintAmt: 0.36, stars: 0.35 },
  { h: 6.7, top: "#3a64b8", mid: "#8aa7dc", bot: "#ffc89a", tint: "#ffb38a", tintAmt: 0.12, stars: 0 },
  { h: 9, top: "#1f78d6", mid: "#5fb0f0", bot: "#c4e8ff", tint: "#ffffff", tintAmt: 0, stars: 0 },
  { h: 15, top: "#1c74d0", mid: "#5aaaee", bot: "#cdebff", tint: "#ffffff", tintAmt: 0, stars: 0 },
  { h: 17, top: "#2f62b4", mid: "#8fa2d8", bot: "#ffd29a", tint: "#ffb070", tintAmt: 0.1, stars: 0 },
  { h: 18.1, top: "#3a3f8f", mid: "#c46a8c", bot: "#ffab5e", tint: "#ff8a4a", tintAmt: 0.2, stars: 0 },
  { h: 19.1, top: "#24245e", mid: "#7a3f74", bot: "#ff7a52", tint: "#5c2f5e", tintAmt: 0.33, stars: 0.15 },
  { h: 20.2, top: "#0d1236", mid: "#252a5c", bot: "#5a3a6c", tint: "#141a44", tintAmt: 0.5, stars: 0.7 },
  { h: 24, top: "#050818", mid: "#0b1433", bot: "#1b2652", tint: "#0b1233", tintAmt: 0.58, stars: 1 },
];

export const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const HK = KEYS.map((k) => ({ ...k, topC: hex(k.top), midC: hex(k.mid), botC: hex(k.bot), tintC: hex(k.tint) }));

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const css = (c: RGB, a = 1) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

const smooth = (t: number) => t * t * (3 - 2 * t);

export interface SkyState {
  hour: number;
  top: RGB;
  mid: RGB;
  bot: RGB;
  tint: RGB;
  tintAmt: number;
  stars: number;
  /** 0 at night → 1 at full day */
  daylight: number;
}

export function skyAt(hour: number): SkyState {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < HK.length - 2 && HK[i + 1].h <= h) i++;
  const a = HK[i], b = HK[i + 1];
  const t = smooth((h - a.h) / (b.h - a.h));
  const s = {
    hour: h,
    top: mix(a.topC, b.topC, t),
    mid: mix(a.midC, b.midC, t),
    bot: mix(a.botC, b.botC, t),
    tint: mix(a.tintC, b.tintC, t),
    tintAmt: a.tintAmt + (b.tintAmt - a.tintAmt) * t,
    stars: a.stars + (b.stars - a.stars) * t,
    daylight: 0,
  };
  s.daylight = 1 - Math.min(1, s.tintAmt / 0.55) * (s.stars > 0 ? 1 : 0.6);
  return s;
}

// Celestial arcs
export const SUNRISE = 5.5;
export const SUNSET = 19.5;
export const DAY_SPAN = SUNSET - SUNRISE;
export const NIGHT_SPAN = 24 - DAY_SPAN;

/** progress 0..1 across the sky for the sun (null if below horizon) */
export function sunProgress(h: number) {
  return h >= SUNRISE && h <= SUNSET ? (h - SUNRISE) / DAY_SPAN : null;
}
export function moonProgress(h: number) {
  const m = h >= SUNSET ? h - SUNSET : h < SUNRISE ? h + 24 - SUNSET : null;
  return m === null ? null : m / NIGHT_SPAN;
}
export function hourFromSun(p: number) {
  return SUNRISE + Math.min(1, Math.max(0, p)) * DAY_SPAN;
}
export function hourFromMoon(p: number) {
  return (SUNSET + Math.min(1, Math.max(0, p)) * NIGHT_SPAN) % 24;
}

/** Arc geometry in viewport fractions */
export const ARC = { x0: 0.05, x1: 0.95, horizon: 0.8, peak: 0.13 };
export function arcPos(p: number, vw: number, vh: number) {
  const x = (ARC.x0 + (ARC.x1 - ARC.x0) * p) * vw;
  const y = (ARC.horizon - Math.sin(p * Math.PI) * (ARC.horizon - ARC.peak)) * vh;
  return { x, y };
}

export function formatHour(h: number) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h - Math.floor(h)) * 60);
  const ampm = hh < 12 ? "AM" : "PM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm.toString().padStart(2, "0")} ${ampm}`;
}

export function phaseName(h: number) {
  if (h < 5) return "Night";
  if (h < 6.5) return "Dawn";
  if (h < 11) return "Morning";
  if (h < 16) return "Day";
  if (h < 18.6) return "Golden hour";
  if (h < 20) return "Dusk";
  return "Night";
}

/** CSS gradient of the horizon colours across a full day (for the time slider track) */
export function dayGradientCss() {
  const stops: string[] = [];
  for (let h = 0; h <= 24; h += 1) {
    const s = skyAt(h === 24 ? 23.99 : h);
    stops.push(`${css(mix(s.mid, s.bot, 0.5))} ${((h / 24) * 100).toFixed(1)}%`);
  }
  return `linear-gradient(90deg, ${stops.join(",")})`;
}
