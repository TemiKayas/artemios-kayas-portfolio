"use client";
import { useSyncExternalStore } from "react";
import { projects } from "@/data/projects";

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

/* ---------------- settings ---------------- */
export type Speed = "normal" | "slow" | "fast" | "frozen";
export type LogoStyle = "stone" | "island" | "ember" | "gilded";
export interface GameSettings {
  sound: boolean;
  speed: Speed;
  logo: LogoStyle;
  scale: "auto" | "2" | "3" | "4";
  critters: boolean;
}
const DEFAULT_SETTINGS: GameSettings = { sound: true, speed: "normal", logo: "stone", scale: "auto", critters: true };
export const SEC_PER_HOUR: Record<Speed, number> = { normal: 10, slow: 30, fast: 1.5, frozen: Infinity };

/* ---------------- achievements ---------------- */
export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string; // sprite name
  career?: boolean; // real-world, always unlocked
}
export const ACHIEVEMENTS: Achievement[] = [
  { id: "spark", name: "Spark of Innovation", desc: "Won the Spark! Innovation Award at Boston University with Learn Wyrm.", icon: "ach_trophy", career: true },
  { id: "innovative", name: "Most Innovative", desc: "Learn Wyrm named Most Innovative Project out of 60+ entries.", icon: "ach_medal", career: true },
  { id: "faculty", name: "Trusted by Faculty", desc: "ClassChat used by faculty at Harvard and Boston University.", icon: "ach_gradcap", career: true },
  { id: "hackathons", name: "Hackathon Victor", desc: "Won hackathons at MIT and Boston University.", icon: "ach_keyboards", career: true },
  { id: "shipper", name: "Shipped to Production", desc: "Shipped code for global companies and a large digital consulting firm.", icon: "ach_rocket", career: true },
  { id: "timekeeper", name: "Timekeeper", desc: "Grab the sun or moon and drag it across the sky.", icon: "ach_sun" },
  { id: "nightowl", name: "Night Owl", desc: "Stay until the stars come out.", icon: "ach_moon" },
  { id: "collector", name: "Collector", desc: "Inspect every item in the Projects inventory.", icon: "ach_chest" },
  { id: "stargazer", name: "Stargazer", desc: "Catch a falling star.", icon: "ach_star" },
  { id: "critter", name: "Critter Friend", desc: "Say hi to one of the locals.", icon: "ach_bunny" },
];

const LS = "ak-game-v1";
interface Persist { settings: GameSettings; unlocked: string[]; inspected: string[] }

export const game = {
  settings: createStore<GameSettings>(DEFAULT_SETTINGS),
  clock: createStore({ hour: 12, dragging: false }),
  unlocked: createStore<Set<string>>(new Set(ACHIEVEMENTS.filter((a) => a.career).map((a) => a.id))),
  inspected: createStore<Set<string>>(new Set()),
  toasts: createStore<{ key: number; a: Achievement }[]>([]),
};

function save() {
  try {
    const p: Persist = {
      settings: game.settings.get(),
      unlocked: [...game.unlocked.get()],
      inspected: [...game.inspected.get()],
    };
    localStorage.setItem(LS, JSON.stringify(p));
  } catch {}
}

export function hydrateGame() {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Persist>;
      if (p.settings) game.settings.set({ ...DEFAULT_SETTINGS, ...p.settings });
      if (p.unlocked) game.unlocked.set(new Set([...game.unlocked.get(), ...p.unlocked]));
      if (p.inspected) game.inspected.set(new Set(p.inspected));
    }
  } catch {}
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) game.settings.set((s) => ({ ...s, speed: "frozen" }));
  const q = new URLSearchParams(location.search);
  const t = q.get("t");
  const d = new Date();
  game.clock.set({ hour: t !== null && !Number.isNaN(+t) ? ((+t % 24) + 24) % 24 : d.getHours() + d.getMinutes() / 60, dragging: false });
  const logo = q.get("logo") as LogoStyle | null;
  if (logo && ["stone", "island", "ember", "gilded"].includes(logo)) game.settings.set((s) => ({ ...s, logo }));
}

export function setSetting<K extends keyof GameSettings>(k: K, v: GameSettings[K]) {
  game.settings.set((s) => ({ ...s, [k]: v }));
  save();
}

let toastKey = 0;
export function unlock(id: string) {
  const cur = game.unlocked.get();
  if (cur.has(id)) return false;
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return false;
  game.unlocked.set(new Set([...cur, id]));
  game.toasts.set((t) => [...t, { key: ++toastKey, a }]);
  save();
  // lazy import to avoid a cycle at module init
  import("./sound").then((m) => m.sfx.achievement());
  return true;
}
export function dismissToast(key: number) {
  game.toasts.set((t) => t.filter((x) => x.key !== key));
}

export function markInspected(id: string) {
  const s = new Set(game.inspected.get());
  s.add(id);
  game.inspected.set(s);
  save();
  if (projects.every((p) => s.has(p.id))) unlock("collector");
}

export function resetProgress() {
  game.unlocked.set(new Set(ACHIEVEMENTS.filter((a) => a.career).map((a) => a.id)));
  game.inspected.set(new Set());
  save();
}

/* hooks */
const useStore = <T,>(s: { get: () => T; subscribe: (f: () => void) => () => void }) =>
  useSyncExternalStore(s.subscribe, s.get, s.get);
export const useGameSettings = () => useStore(game.settings);
export const useGameClock = () => useStore(game.clock);
export const useUnlocked = () => useStore(game.unlocked);
export const useInspected = () => useStore(game.inspected);
export const useToasts = () => useStore(game.toasts);
