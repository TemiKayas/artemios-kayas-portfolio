"use client";
// Tiny external stores (no re-render storms): the sky clock + design-lab settings.
import { useSyncExternalStore } from "react";

function createStore<T>(initial: T) {
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set(next: T | ((v: T) => T)) {
      value = typeof next === "function" ? (next as (v: T) => T)(value) : next;
      subs.forEach((f) => f());
    },
    subscribe(f: () => void) {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}

/* ---------------- Clock ---------------- */
export const START_HOUR = 17.75; // golden hour
export const clock = createStore({ hour: START_HOUR, dragging: false });

/** Throttled hook: re-renders at most ~8x/sec */
export function useClock() {
  return useSyncExternalStore(clock.subscribe, clock.get, clock.get);
}

/* ---------------- Design lab settings ---------------- */
export const OPTIONS = {
  hero: ["h2", "h5", "h1", "h3", "h4"],
  layout: ["split", "center"],
  type: ["storybook", "pixel", "modern", "editorial"],
  celestial: ["vector", "pixel"],
  render: ["hd", "pixel"],
  speed: ["normal", "slow", "fast", "paused"],
  work: ["bento", "gallery", "index"],
} as const;

export type Settings = { -readonly [K in keyof typeof OPTIONS]: (typeof OPTIONS)[K][number] };
export const DEFAULTS: Settings = {
  hero: "h2",
  layout: "split",
  type: "storybook",
  celestial: "vector",
  render: "hd",
  speed: "normal",
  work: "bento",
};

export const LABELS: Record<keyof Settings, { title: string; values: Record<string, string> }> = {
  hero: { title: "Hero island", values: { h1: "Pine forest", h2: "Cabin", h3: "Observatory", h4: "Archipelago", h5: "Radio outpost" } },
  layout: { title: "Hero layout", values: { split: "Split", center: "Centered" } },
  type: { title: "Typography", values: { storybook: "Storybook", pixel: "Pixel", modern: "Modern", editorial: "Editorial" } },
  celestial: { title: "Sun & moon", values: { vector: "Painted", pixel: "Pixel" } },
  render: { title: "World render", values: { hd: "HD", pixel: "Pixel-art" } },
  speed: { title: "Day length", values: { normal: "6 min", slow: "16 min", fast: "1 min", paused: "Paused" } },
  work: { title: "Projects layout", values: { bento: "Bento", gallery: "Gallery", index: "Index" } },
};

export const SPEED_SEC_PER_HOUR: Record<Settings["speed"], number> = {
  normal: 15,
  slow: 40,
  fast: 2.5,
  paused: Infinity,
};

export const settings = createStore<Settings>(DEFAULTS);

export function useSettings() {
  return useSyncExternalStore(settings.subscribe, settings.get, () => DEFAULTS);
}

const LS_KEY = "ak-lab-v1";
export function hydrateSettings() {
  let next: Settings = { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) next = { ...next, ...JSON.parse(raw) };
  } catch {}
  const q = new URLSearchParams(location.search);
  (Object.keys(OPTIONS) as (keyof Settings)[]).forEach((k) => {
    const v = q.get(k);
    if (v && (OPTIONS[k] as readonly string[]).includes(v)) (next as Record<string, string>)[k] = v;
  });
  // sanitize
  (Object.keys(OPTIONS) as (keyof Settings)[]).forEach((k) => {
    if (!(OPTIONS[k] as readonly string[]).includes(next[k])) (next as Record<string, string>)[k] = DEFAULTS[k];
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches && !q.get("speed")) next.speed = "paused";
  settings.set(next);
  const t = Number(q.get("t"));
  if (q.get("t") && !Number.isNaN(t)) clock.set((c) => ({ ...c, hour: ((t % 24) + 24) % 24 }));
}

export function updateSetting<K extends keyof Settings>(k: K, v: Settings[K]) {
  settings.set((s) => ({ ...s, [k]: v }));
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(settings.get()));
  } catch {}
  const url = new URL(location.href);
  if (v === DEFAULTS[k]) url.searchParams.delete(k);
  else url.searchParams.set(k, v);
  history.replaceState(null, "", url);
}
