"use client";

import { useEffect, useRef } from "react";
import { SPRITES, spriteSrc, type SpriteName } from "@/lib/game/sprites";
import { game, SEC_PER_HOUR, unlock, type GameSettings } from "@/lib/game/state";
import { sfx } from "@/lib/game/sound";
import { css, hourFromMoon, hourFromSun, mix, moonProgress, skyAt, sunProgress, type RGB } from "@/lib/sky";

/* ================================================================== */
/* deterministic noise                                                 */
/* ================================================================== */
function hash(x: number, y = 0, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t: number) => t * t * (3 - 2 * t);
const pmod = (a: number, n: number) => ((a % n) + n) % n;
function noise1(x: number, s = 0) {
  const i = Math.floor(x), f = x - i;
  return hash(i, 0, s) * (1 - fade(f)) + hash(i + 1, 0, s) * fade(f);
}
function noise2(x: number, y: number, s = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = fade(x - ix), fy = fade(y - iy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

/* ================================================================== */
/* images                                                              */
/* ================================================================== */
const cache = new Map<string, HTMLImageElement>();
function sprite(n: SpriteName) {
  let i = cache.get(n);
  if (!i) { i = new Image(); i.src = spriteSrc(n); cache.set(n, i); }
  return i;
}
const ok = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;
function flipped(img: HTMLImageElement) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext("2d")!;
  x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(img, 0, 0);
  return c;
}

/* ================================================================== */
/* tiles                                                               */
/* ================================================================== */
const T = 8; // tile size in art px
type Tile = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // air, grass, dirt, stone, copper, iron, gold, gem, cave-wall
const PAL: Record<string, string[]> = {
  dirt: ["#7b4b2a", "#8c5a33", "#6a3e22", "#94643a"],
  stone: ["#6d6f7c", "#7d808d", "#5c5e6b", "#888b97"],
  grass: ["#4fb33e", "#3f9632", "#6fd24c", "#2f7a28"],
  copper: ["#e08a3c", "#b0602a"],
  iron: ["#d8cfc4", "#a99c8e"],
  gold: ["#ffd84a", "#c99a1e"],
  gem: ["#5ad0ff", "#b45cff"],
};

function makeTileAtlas() {
  const c = document.createElement("canvas");
  c.width = T * 9 * 4; c.height = T; // 9 tile types × 4 variants
  const x = c.getContext("2d")!;
  const px = (tx: number, i: number, j: number, col: string) => { x.fillStyle = col; x.fillRect(tx + i, j, 1, 1); };
  for (let v = 0; v < 4; v++) {
    for (let t = 1; t <= 8; t++) {
      const tx = (t * 4 + v) * T;
      const base = t === 3 || t >= 4 && t <= 7 ? PAL.stone : PAL.dirt;
      for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) {
        const r = hash(i + v * 17, j + t * 31, 9);
        px(tx, i, j, r < 0.62 ? base[0] : r < 0.8 ? base[1] : r < 0.93 ? base[2] : base[3]);
      }
      if (t === 1) {
        for (let i = 0; i < T; i++) {
          const depth = 2 + Math.floor(hash(i, v, 5) * 2.2);
          for (let j = 0; j < depth; j++) px(tx, i, j, j === 0 ? (hash(i, v, 6) < 0.5 ? PAL.grass[2] : PAL.grass[0]) : hash(i, j + v, 7) < 0.6 ? PAL.grass[0] : PAL.grass[1]);
          px(tx, i, depth, PAL.grass[3]);
        }
      }
      if (t >= 4 && t <= 7) {
        const ore = [PAL.copper, PAL.iron, PAL.gold, PAL.gem][t - 4];
        for (let k = 0; k < 6; k++) {
          const i = 1 + Math.floor(hash(k, v, t) * 6), j = 1 + Math.floor(hash(k, v, t + 50) * 6);
          px(tx, i, j, ore[0]); px(tx, i + 1, j, ore[1]); if (k % 2) px(tx, i, j + 1, ore[1]);
        }
      }
      if (t === 8) { // cave wall: darkened stone/dirt
        x.fillStyle = "rgba(14,10,26,0.5)";
        x.fillRect(tx, 0, T, T);
      }
    }
  }
  return c;
}

interface Column { surface: number; dirtDepth: number }

/* ================================================================== */
/* clouds                                                              */
/* ================================================================== */
function makeCloud(seed: number) {
  const w = 34 + Math.floor(hash(seed, 1) * 40), h = 18;
  const c = document.createElement("canvas");
  c.width = w + 4; c.height = h + 4;
  const x = c.getContext("2d")!;
  const blobs: [number, number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const r = 4 + hash(seed, i, 3) * 6;
    blobs.push([4 + r + hash(seed, i, 4) * (w - 2 * r - 4), h - r - hash(seed, i, 5) * 4, r]);
  }
  const img = x.createImageData(c.width, c.height);
  for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
    let inside = false, lowest = 0;
    for (const [cx, cy, r] of blobs) if ((i - cx) ** 2 + (j - cy) ** 2 <= r * r) { inside = true; lowest = Math.max(lowest, j - cy + r); }
    if (!inside || j > h + 1) continue;
    const shade = j > h - 3 ? [205, 214, 232] : j > h - 6 && (i + j) % 2 ? [228, 233, 245] : [250, 252, 255];
    const k = (j * c.width + i) * 4;
    img.data[k] = shade[0]; img.data[k + 1] = shade[1]; img.data[k + 2] = shade[2]; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

/* ================================================================== */
/* pixel sun / moon                                                    */
/* ================================================================== */
function drawSun(c: CanvasRenderingContext2D, cx: number, cy: number, t: number, big: number) {
  const R = 7 * big;
  for (let k = 3; k >= 1; k--) {
    c.fillStyle = `rgba(255,200,90,${0.08 * k})`;
    const e = R + k * 3 + (k === 3 ? Math.round(Math.sin(t * 2)) : 0);
    c.fillRect(cx - e + 2, cy - e, e * 2 - 4, e * 2);
    c.fillRect(cx - e, cy - e + 2, e * 2, e * 2 - 4);
  }
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
    const d = Math.hypot(i, j) / R;
    if (d > 1) continue;
    c.fillStyle = d > 0.85 ? "#f39a2e" : d > 0.62 ? "#ffbf3f" : d > 0.35 ? "#ffde68" : "#fff6c2";
    if (d > 0.4 && d < 0.85 && (i * 3 + j * 5 + Math.floor(t * 3)) % 11 === 0) c.fillStyle = "#ffe98a";
    c.fillRect(cx + i, cy + j, 1, 1);
  }
}
function drawMoon(c: CanvasRenderingContext2D, cx: number, cy: number, sky: RGB, big: number) {
  const R = 6 * big;
  c.fillStyle = "rgba(190,210,255,0.12)";
  c.fillRect(cx - R - 5, cy - R - 3, R * 2 + 10, R * 2 + 6);
  c.fillRect(cx - R - 3, cy - R - 5, R * 2 + 6, R * 2 + 10);
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
    const d = Math.hypot(i, j) / R;
    if (d > 1) continue;
    const shadow = Math.hypot(i + R * 0.9, j + 1) / R < 0.95;
    if (shadow) { c.fillStyle = css(mix(sky, [20, 24, 60], 0.35), 0.9); }
    else {
      c.fillStyle = d > 0.85 ? "#bdb8cc" : "#f3efe0";
      if ((i === 2 && j === -2) || (i === 3 && j === -2) || (i === 1 && j === 3) || (i === 4 && j === 2)) c.fillStyle = "#cdc7b4";
    }
    c.fillRect(cx + i, cy + j, 1, 1);
  }
}

/* ================================================================== */
/* component                                                           */
/* ================================================================== */
export default function World() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const layer = document.createElement("canvas");
    const lx = layer.getContext("2d")!;
    const skyC = document.createElement("canvas");
    const sx = skyC.getContext("2d")!;
    const atlas = makeTileAtlas();
    const clouds = Array.from({ length: 6 }, (_, i) => makeCloud(i + 3));

    let S = 3, W = 0, H = 0, groundRow = 0;
    let settings: GameSettings = game.settings.get();
    let hour = game.clock.get().hour, lastWritten = hour, lastPush = 0, skyHour = -1;
    let camX = 64 * 8 * 4;
    let drag: null | "sun" | "moon" = null;
    let hoverBody = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let farFlip: HTMLCanvasElement | null = null, midFlip: HTMLCanvasElement | null = null;

    const all = Object.keys(SPRITES) as SpriteName[];
    const worldSprites = all.filter((n) => !n.startsWith("item_") && !n.startsWith("logo_") && !n.startsWith("ach_"));
    Promise.all(worldSprites.map((n) => sprite(n).decode().catch(() => {}))).then(() => chunks.clear());

    /* ---------------- terrain ---------------- */
    const colCache = new Map<number, Column>();
    function column(c: number): Column {
      let v = colCache.get(c);
      if (!v) {
        const h = Math.round(noise1(c * 0.06, 1) * 5 + noise1(c * 0.21, 2) * 2 - 3.5);
        v = { surface: groundRow - h, dirtDepth: 3 + Math.round(noise1(c * 0.15, 3) * 3) };
        colCache.set(c, v);
      }
      return v;
    }
    function tileAt(c: number, r: number): Tile {
      const col = column(c);
      if (r < col.surface) return 0;
      const depth = r - col.surface;
      if (depth > 5 && noise2(c * 0.11, r * 0.22, 4) > 0.72) return 8;
      if (depth === 0) return 1;
      if (depth <= col.dirtDepth) return 2;
      const o = hash(c, r, 11);
      if (o < 0.035) return (4 + Math.floor(hash(c, r, 12) * (depth > 9 ? 4 : 2))) as Tile;
      return 3;
    }
    const surfaceY = (wx: number) => column(Math.floor(wx / T)).surface * T;

    interface Deco { name: SpriteName; x: number; y: number; light?: "fire" | "torch" }
    const chunkW = 32; // columns
    const chunks = new Map<number, { canvas: HTMLCanvasElement; lights: Deco[] }>();
    const TOP_PAD = 90;
    function decoFor(c: number): Deco | null {
      const r = hash(c, 0, 21);
      const sy = column(c).surface * T;
      const x = c * T;
      const flat = Math.abs(column(c - 1).surface - column(c).surface) + Math.abs(column(c + 1).surface - column(c).surface) === 0;
      const pick = (n: SpriteName, dx = 0): Deco => ({ name: n, x: x + dx - Math.floor(SPRITES[n][0] / 2) + T / 2, y: sy - SPRITES[n][1] + 1 });
      if (pmod(c, 61) === 13 && flat) return { ...pick("campfire_s"), light: "fire" };
      if (pmod(c, 47) === 30) return { name: "torch" as SpriteName, x: x + 3, y: sy - 9, light: "torch" };
      if (r < 0.11 && hash(c - 1, 0, 21) >= 0.11 && hash(c - 2, 0, 21) >= 0.11) {
        const trees: SpriteName[] = ["tree_oak1", "tree_oak2", "tree_pine0", "tree_pine1", "tree_oak0", "tree_pine2"];
        return pick(trees[Math.floor(hash(c, 1, 22) * trees.length)]);
      }
      if (r < 0.2) return pick((["grass0_s", "grass1_s"] as SpriteName[])[pmod(c, 2)]);
      if (r < 0.27) return pick((["flower_red_s", "flower_sun_s", "flower_white_s"] as SpriteName[])[pmod(c, 3)]);
      if (r < 0.3) return pick("mushroom_s");
      if (r < 0.325 && flat) return pick("bush_s");
      if (r < 0.34 && flat) return pick("boulder_s");
      return null;
    }
    function drawTorch(x: CanvasRenderingContext2D, d: Deco) {
      x.fillStyle = "#6b4423"; x.fillRect(d.x, d.y + 3, 2, 6);
      x.fillStyle = "#ffb43c"; x.fillRect(d.x, d.y + 1, 2, 2);
      x.fillStyle = "#fff2a8"; x.fillRect(d.x, d.y + 2, 1, 1);
    }
    function buildChunk(k: number) {
      const c0 = k * chunkW;
      const canvas = document.createElement("canvas");
      canvas.width = chunkW * T; canvas.height = H + TOP_PAD;
      const x = canvas.getContext("2d")!;
      const oy = TOP_PAD; // canvas y = world y + oy
      const rows = Math.ceil(H / T) + 1;
      const lights: Deco[] = [];
      // tiles
      for (let ci = 0; ci < chunkW; ci++) {
        const c = c0 + ci;
        for (let r = column(c).surface; r < rows; r++) {
          const t = tileAt(c, r);
          if (!t) continue;
          const v = Math.floor(hash(c, r, 13) * 4);
          x.drawImage(atlas, (t * 4 + v) * T, 0, T, T, ci * T, r * T + oy, T, T);
          if (t === 8) continue;
          // exposed edges → dark outline (block look)
          x.fillStyle = "rgba(20,12,28,0.55)";
          const open = (cc: number, rr: number) => { const n = tileAt(cc, rr); return n === 0 || n === 8; };
          if (open(c, r - 1) && t !== 1) x.fillRect(ci * T, r * T + oy, T, 1);
          if (open(c, r + 1)) x.fillRect(ci * T, r * T + oy + T - 1, T, 1);
          if (open(c - 1, r)) x.fillRect(ci * T, r * T + oy, 1, T);
          if (open(c + 1, r)) x.fillRect(ci * T + T - 1, r * T + oy, 1, T);
          if (t === 1) { // grass blades poking up
            x.fillStyle = PAL.grass[0];
            for (let i = 0; i < T; i += 2) if (hash(c, i, 30) < 0.5) x.fillRect(ci * T + i, r * T + oy - 1, 1, 1 + (hash(c, i, 31) < 0.3 ? 1 : 0));
            if (open(c - 1, r)) { x.fillStyle = PAL.grass[3]; x.fillRect(ci * T, r * T + oy, 1, 3); }
            if (open(c + 1, r)) { x.fillStyle = PAL.grass[3]; x.fillRect(ci * T + T - 1, r * T + oy, 1, 3); }
          }
        }
      }
      // decorations (include neighbours that overlap into this chunk)
      for (let c = c0 - 6; c < c0 + chunkW + 6; c++) {
        const d = decoFor(c);
        if (!d) continue;
        const local = { ...d, x: d.x - c0 * T, y: d.y + oy };
        if (d.name === ("torch" as SpriteName)) drawTorch(x, local);
        else {
          const im = sprite(d.name);
          if (ok(im)) x.drawImage(im, local.x, local.y);
        }
        if (d.light && c >= c0 && c < c0 + chunkW) lights.push(d);
      }
      // underground darkness gradient
      x.globalCompositeOperation = "source-atop";
      const g = x.createLinearGradient(0, groundRow * T + oy, 0, H + oy);
      g.addColorStop(0, "rgba(8,6,20,0)");
      g.addColorStop(0.35, "rgba(8,6,20,0.25)");
      g.addColorStop(1, "rgba(8,6,20,0.55)");
      x.fillStyle = g; x.fillRect(0, groundRow * T + oy + T * 2, canvas.width, H);
      x.globalCompositeOperation = "source-over";
      return { canvas, lights };
    }
    function chunk(k: number) {
      let c = chunks.get(k);
      if (!c) { c = buildChunk(k); chunks.set(k, c); }
      return c;
    }

    /* ---------------- critters ---------------- */
    interface Critter { kind: "bunny" | "snail" | "squirrel"; x: number; vx: number; hop: number; vy: number; y: number; heart: number; flip: boolean; t: number }
    let critters: Critter[] = [];
    const birds: { x: number; y: number; v: number; ph: number }[] = [];
    let flies: { x: number; y: number; ph: number }[] = [];
    const butterflies: { x: number; y: number; ph: number; vx: number }[] = [];
    let falling: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextFall = 6;
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; col: string }[] = [];
    let stars: { x: number; y: number; p: number; s: number; big: boolean }[] = [];
    let skyThings: { name: SpriteName; x: number; y: number; depth: number; bob: number }[] = [];
    let cloudThings: { i: number; x: number; y: number; depth: number; v: number }[] = [];

    function resetScene() {
      const r = (i: number, s: number) => hash(i, s, 77);
      stars = Array.from({ length: Math.round((W * H) / 260) }, (_, i) => ({ x: r(i, 1) * W, y: r(i, 2) ** 1.3 * groundRow * T * 0.95, p: r(i, 3) * 6.28, s: 0.6 + r(i, 4) * 2.2, big: r(i, 5) < 0.05 }));
      skyThings = [
        { name: "sky_isl0", x: W * 0.2, y: H * 0.22, depth: 0.18, bob: 0 },
        { name: "sky_isl1", x: W * 0.85, y: H * 0.3, depth: 0.22, bob: 2 },
        { name: "sky_isl2", x: W * 1.35, y: H * 0.18, depth: 0.15, bob: 4 },
        { name: "sky_rock0", x: W * 0.62, y: H * 0.42, depth: 0.25, bob: 1 },
        { name: "sky_rock1", x: W * 1.1, y: H * 0.5, depth: 0.3, bob: 3 },
      ];
      cloudThings = Array.from({ length: Math.max(4, Math.round(W / 70)) }, (_, i) => ({ i: i % clouds.length, x: r(i, 9) * W * 1.6, y: 6 + r(i, 10) * H * 0.38, depth: 0.08 + r(i, 11) * 0.12, v: 2 + r(i, 12) * 3 }));
      critters = [
        { kind: "bunny", x: camX + W * 0.25, vx: 0, hop: 0, vy: 0, y: 0, heart: 0, flip: false, t: 1 },
        { kind: "bunny", x: camX + W * 0.7, vx: 0, hop: 0, vy: 0, y: 0, heart: 0, flip: true, t: 3 },
        { kind: "snail", x: camX + W * 0.48, vx: 1.2, hop: 0, vy: 0, y: 0, heart: 0, flip: false, t: 0 },
        { kind: "squirrel", x: camX + W * 0.9, vx: 0, hop: 0, vy: 0, y: 0, heart: 0, flip: true, t: 2 },
      ];
      flies = Array.from({ length: 16 }, (_, i) => ({ x: r(i, 20) * W, y: groundRow * T - 10 - r(i, 21) * 40, ph: r(i, 22) * 6.28 }));
    }

    function resize() {
      const vw = window.innerWidth, vh = window.innerHeight;
      S = settings.scale === "auto" ? Math.max(2, Math.min(4, Math.round(Math.min(vw / 460, vh / 300)))) : +settings.scale;
      W = Math.ceil(vw / S); H = Math.ceil(vh / S);
      for (const c of [canvas, layer]) { c.width = W; c.height = H; }
      skyC.width = W; skyC.height = H;
      canvas.style.width = `${W * S}px`; canvas.style.height = `${H * S}px`;
      ctx.imageSmoothingEnabled = lx.imageSmoothingEnabled = false;
      groundRow = Math.floor((H * (vw < 700 ? 0.8 : 0.76)) / T);
      colCache.clear(); chunks.clear(); skyHour = -1;
      resetScene();
    }

    /* ---------------- sky ---------------- */
    function paintSky(sky: ReturnType<typeof skyAt>) {
      const bands = 22, horizon = groundRow * T;
      for (let b = 0; b < bands; b++) {
        const t = b / (bands - 1);
        const col = t < 0.55 ? mix(sky.top, sky.mid, t / 0.55) : mix(sky.mid, sky.bot, (t - 0.55) / 0.45);
        const y0 = Math.floor((b / bands) * horizon), y1 = Math.floor(((b + 1) / bands) * horizon);
        sx.fillStyle = css(col);
        sx.fillRect(0, y0, W, y1 - y0);
        // ordered dither into next band
        if (b < bands - 1) {
          const t2 = (b + 1) / (bands - 1);
          const c2 = t2 < 0.55 ? mix(sky.top, sky.mid, t2 / 0.55) : mix(sky.mid, sky.bot, (t2 - 0.55) / 0.45);
          sx.fillStyle = css(c2);
          for (let x = (y1 % 2); x < W; x += 2) sx.fillRect(x, y1 - 1, 1, 1);
        }
      }
      sx.fillStyle = css(sky.bot);
      sx.fillRect(0, horizon, W, H - horizon);
    }

    function arc(p: number) {
      // horizon = just below the hill crests so bodies set behind the hills but stay visible most of the day
      const horizon = groundRow * T + 10 - SPRITES.bg_mid[1] + 34;
      return { x: Math.round(W * (0.04 + 0.92 * p)), y: Math.round(horizon - Math.sin(p * Math.PI) * (horizon - H * 0.09)) };
    }

    function tintLayer(sky: ReturnType<typeof skyAt>, haze: number, k = 1) {
      lx.globalCompositeOperation = "source-atop";
      if (haze > 0) { lx.fillStyle = css(mix(sky.mid, sky.bot, 0.6), haze); lx.fillRect(0, 0, W, H); }
      const ta = sky.tintAmt * k;
      if (ta > 0.005) { lx.fillStyle = css(sky.tint, ta); lx.fillRect(0, 0, W, H); }
      lx.globalCompositeOperation = "source-over";
      ctx.drawImage(layer, 0, 0);
      lx.clearRect(0, 0, W, H);
    }

    function tiled(img: HTMLImageElement, flip: HTMLCanvasElement | null, par: number, bottom: number) {
      if (!ok(img)) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      const off = Math.floor(camX * par);
      const start = Math.floor(off / w);
      for (let i = start; i * w - off < W; i++) {
        const src = i % 2 && flip ? flip : img;
        lx.drawImage(src, i * w - off, bottom - h);
      }
    }

    /* ---------------- loop ---------------- */
    let raf = 0, last = performance.now(), Tm = 0;
    function frame(now: number) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now; Tm += dt;
      if (!reduced) camX += dt * 7;

      const sph = SEC_PER_HOUR[settings.speed];
      if (!drag && Number.isFinite(sph)) hour = (hour + dt / sph) % 24;
      if (now - lastPush > 150 || drag) { lastPush = now; lastWritten = hour; game.clock.set({ hour, dragging: !!drag }); }

      const sky = skyAt(hour);
      if (sky.stars > 0.85) unlock("nightowl");

      // sky (cached, repaint when time moved)
      if (Math.abs(hour - skyHour) > 0.02) { paintSky(sky); skyHour = hour; }
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(skyC, 0, 0);

      // stars
      if (sky.stars > 0.02) {
        for (const s of stars) {
          const a = sky.stars * (0.35 + 0.65 * Math.abs(Math.sin(Tm * s.s * 0.6 + s.p)));
          ctx.fillStyle = `rgba(255,250,230,${a.toFixed(2)})`;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
          if (s.big && a > 0.6) { ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y), 3, 1); ctx.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, 3); }
        }
      }

      // clouds (behind the sun/moon so they stay findable)
      for (const c of cloudThings) {
        const span = W * 1.6;
        const x = (((c.x - camX * c.depth - Tm * c.v) % span) + span) % span - 60;
        lx.globalAlpha = 0.92; lx.drawImage(clouds[c.i], Math.round(x), Math.round(c.y)); lx.globalAlpha = 1;
      }
      tintLayer(sky, 0.3);

      // sun & moon
      const big = drag ? 1.15 : hoverBody ? 1.07 : 1;
      const sp = sunProgress(hour), mp = moonProgress(hour);
      if (mp !== null) { const p = arc(mp); drawMoon(ctx, p.x, p.y, sky.mid, big); }
      if (sp !== null) { const p = arc(sp); drawSun(ctx, p.x, p.y, Tm, big); }

      // falling star (night)
      if (sky.stars > 0.6 && !reduced) {
        nextFall -= dt;
        if (!falling && nextFall < 0) { falling = { x: W * (0.3 + Math.random() * 0.7), y: -4, vx: -(28 + Math.random() * 18), vy: 22 + Math.random() * 10, life: 1 }; nextFall = 7 + Math.random() * 8; }
      }
      if (falling) {
        const f = falling;
        f.x += f.vx * dt; f.y += f.vy * dt;
        for (let i = 0; i < 8; i++) { ctx.fillStyle = `rgba(255,240,170,${(1 - i / 8) * 0.8})`; ctx.fillRect(Math.round(f.x - f.vx * i * 0.03), Math.round(f.y - f.vy * i * 0.03), 1, 1); }
        ctx.fillStyle = "#fff6c2"; ctx.fillRect(Math.round(f.x) - 1, Math.round(f.y) - 1, 3, 3);
        ctx.fillStyle = "#ffd84a"; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
        if (f.y > groundRow * T || f.x < -10) falling = null;
      }

      // far layer: mountains + sky islands + clouds
      const farImg = sprite("bg_far"), midImg = sprite("bg_mid");
      if (ok(farImg) && !farFlip) farFlip = flipped(farImg);
      if (ok(midImg) && !midFlip) midFlip = flipped(midImg);
      tiled(farImg, farFlip, 0.06, groundRow * T - 8);
      for (const s of skyThings) {
        const im = sprite(s.name); if (!ok(im)) continue;
        const span = W * 1.8;
        const x = (((s.x - camX * s.depth) % span) + span) % span - 50;
        lx.drawImage(im, Math.round(x), Math.round(s.y + Math.sin(Tm * 0.5 + s.bob) * 2));
      }
      tintLayer(sky, 0.38);

      // mid hills
      tiled(midImg, midFlip, 0.22, groundRow * T + 10);
      tintLayer(sky, 0.16);

      // birds (day)
      if (sky.stars < 0.05 && settings.critters && !reduced) {
        if (birds.length < 3 && Math.random() < dt * 0.15) birds.push({ x: -20, y: 12 + Math.random() * H * 0.3, v: 14 + Math.random() * 10, ph: Math.random() * 6 });
      }
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i]; b.x += b.v * dt;
        const im = sprite(Math.sin(Tm * 10 + b.ph) > 0 ? "bird0_s" : "bird1_s");
        if (ok(im)) ctx.drawImage(im, Math.round(b.x), Math.round(b.y + Math.sin(Tm * 2 + b.ph) * 2));
        if (b.x > W + 20) birds.splice(i, 1);
      }

      // terrain chunks
      const k0 = Math.floor(camX / (chunkW * T)), k1 = Math.floor((camX + W) / (chunkW * T));
      const lights: { x: number; y: number; kind: string }[] = [];
      for (let k = k0; k <= k1; k++) {
        const ch = chunk(k);
        lx.drawImage(ch.canvas, Math.round(k * chunkW * T - camX), -TOP_PAD);
        for (const l of ch.lights) lights.push({ x: l.x - camX + (l.light === "torch" ? 1 : SPRITES.campfire_s[0] / 2), y: l.y + (l.light === "torch" ? 2 : 6), kind: l.light! });
      }
      for (const k of chunks.keys()) if (k < k0 - 2 || k > k1 + 2) chunks.delete(k);

      // critters on the ground layer
      if (settings.critters) {
        for (const c of critters) {
          if (c.x - camX < -40) c.x = camX + W + 20 + Math.random() * 40;
          if (c.x - camX > W + 60) c.x = camX - 20;
          c.t -= dt;
          if (c.kind === "bunny") {
            if (c.hop === 0 && c.t < 0) { c.hop = 1; c.vy = -38; c.vx = (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 10); c.flip = c.vx < 0; c.t = 0.6 + Math.random() * 2.2; }
            if (c.hop) { c.y += c.vy * dt; c.vy += 140 * dt; c.x += c.vx * dt; if (c.y >= 0) { c.y = 0; c.hop = 0; } }
          } else if (c.kind === "snail") { c.x += c.vx * dt; }
          else if (c.kind === "squirrel") {
            if (c.t < 0) { c.vx = (Math.random() < 0.5 ? -1 : 1) * 30; c.flip = c.vx < 0; c.t = 0.4 + Math.random(); }
            c.x += c.vx * dt; c.vx *= 1 - dt * 3;
          }
          const name: SpriteName = c.kind === "bunny" ? (c.hop ? "bunny1_s" : "bunny0_s") : c.kind === "snail" ? "snail_s" : "squirrel_s";
          const im = sprite(name); if (!ok(im)) continue;
          const sx0 = Math.round(c.x - camX), sy0 = Math.round(surfaceY(c.x) - im.naturalHeight + 1 + c.y);
          if (c.flip) { lx.save(); lx.translate(sx0 + im.naturalWidth, sy0); lx.scale(-1, 1); lx.drawImage(im, 0, 0); lx.restore(); }
          else lx.drawImage(im, sx0, sy0);
          if (c.heart > 0) {
            c.heart -= dt;
            lx.fillStyle = "#ff5a7a";
            const hx = sx0 + 4, hy = Math.round(sy0 - 6 - (1 - c.heart) * 8);
            lx.fillRect(hx, hy, 2, 1); lx.fillRect(hx + 3, hy, 2, 1); lx.fillRect(hx, hy + 1, 5, 1); lx.fillRect(hx + 1, hy + 2, 3, 1); lx.fillRect(hx + 2, hy + 3, 1, 1);
          }
        }
        // butterflies (day)
        if (sky.stars < 0.05) {
          if (butterflies.length < 2 && Math.random() < dt * 0.2) butterflies.push({ x: -10, y: groundRow * T - 20 - Math.random() * 20, ph: Math.random() * 6, vx: 8 + Math.random() * 6 });
          for (let i = butterflies.length - 1; i >= 0; i--) {
            const b = butterflies[i]; b.x += b.vx * dt;
            const im = sprite("butterfly_s");
            if (ok(im)) {
              const flap = Math.sin(Tm * 14 + b.ph) > 0;
              const w = flap ? im.naturalWidth : Math.max(2, Math.round(im.naturalWidth / 3));
              lx.drawImage(im, Math.round(b.x + (im.naturalWidth - w) / 2), Math.round(b.y + Math.sin(Tm * 2.5 + b.ph) * 6), w, im.naturalHeight);
            }
            if (b.x > W + 10) butterflies.splice(i, 1);
          }
        }
      }
      tintLayer(sky, 0, 0.92);

      // lights (night): campfires + torches + fireflies
      const night = Math.min(1, sky.tintAmt / 0.45);
      if (night > 0.05) {
        ctx.globalCompositeOperation = "lighter";
        for (const l of lights) {
          const R = (l.kind === "fire" ? 26 : 14) + Math.sin(Tm * 9 + l.x) * 1.5;
          const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, R);
          g.addColorStop(0, `rgba(255,170,70,${0.55 * night})`);
          g.addColorStop(1, "rgba(255,120,40,0)");
          ctx.fillStyle = g; ctx.fillRect(l.x - R, l.y - R, R * 2, R * 2);
        }
        if (sky.stars > 0.3 && settings.critters) {
          for (const f of flies) {
            const x = ((f.x + Math.sin(Tm * 0.4 + f.ph) * 20 - camX * 0.3) % W + W) % W;
            const y = f.y + Math.sin(Tm * 0.7 + f.ph * 2) * 6;
            const a = sky.stars * Math.max(0, Math.sin(Tm * 1.7 + f.ph));
            ctx.fillStyle = `rgba(200,255,120,${(a * 0.35).toFixed(2)})`; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
            ctx.fillStyle = `rgba(240,255,170,${a.toFixed(2)})`; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 40 * dt; s.life -= dt * 1.4;
        ctx.fillStyle = s.col; ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
        ctx.globalAlpha = 1;
        if (s.life <= 0) sparks.splice(i, 1);
      }

      raf = requestAnimationFrame(frame);
    }

    /* ---------------- input ---------------- */
    const toArt = (e: PointerEvent) => ({ x: e.clientX / S, y: e.clientY / S });
    function bodyAt(x: number, y: number) {
      const sp = sunProgress(hour), mp = moonProgress(hour);
      if (sp !== null) { const p = arc(sp); if (Math.hypot(x - p.x, y - p.y) < 20) return "sun" as const; }
      if (mp !== null) { const p = arc(mp); if (Math.hypot(x - p.x, y - p.y) < 18) return "moon" as const; }
      return null;
    }
    function burst(x: number, y: number, cols: string[], n = 18) {
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 10 + Math.random() * 30; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 15, life: 1, col: cols[i % cols.length] }); }
    }
    const onDown = (e: PointerEvent) => {
      sfx.unlock();
      const { x, y } = toArt(e);
      const b = bodyAt(x, y);
      if (b) { drag = b; canvas.setPointerCapture(e.pointerId); sfx.grab(); unlock("timekeeper"); e.preventDefault(); return; }
      if (falling && Math.hypot(x - falling.x, y - falling.y) < 12) {
        burst(falling.x, falling.y, ["#fff6c2", "#ffd84a", "#ffffff"], 26); falling = null; sfx.star(); unlock("stargazer"); return;
      }
      for (const c of critters) {
        const cx = c.x - camX, cy = surfaceY(c.x) - 8 + c.y;
        if (Math.abs(x - cx - 6) < 12 && Math.abs(y - cy) < 12) { c.heart = 1; if (c.kind === "bunny" && !c.hop) { c.t = 0; } sfx.pop(); unlock("critter"); return; }
      }
    };
    const onMove = (e: PointerEvent) => {
      const { x, y } = toArt(e);
      if (drag) {
        const p = (x / W - 0.04) / 0.92;
        hour = drag === "sun" ? hourFromSun(p) : hourFromMoon(p);
        return;
      }
      const b = bodyAt(x, y);
      hoverBody = !!b;
      canvas.style.cursor = b ? "grab" : "";
    };
    const onUp = () => { if (drag) { drag = null; sfx.drop(); game.clock.set({ hour, dragging: false }); canvas.style.cursor = "grab"; } };

    const unClock = game.clock.subscribe(() => {
      const c = game.clock.get();
      if (!drag && Math.abs(c.hour - lastWritten) > 1e-6) { hour = c.hour; lastWritten = c.hour; skyHour = -1; }
    });
    const unSettings = game.settings.subscribe(() => {
      const prev = settings; settings = game.settings.get();
      if (prev.scale !== settings.scale) resize();
    });

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf); unClock(); unSettings();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return <canvas ref={ref} className="world" aria-hidden="true" />;
}
