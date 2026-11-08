"use client";

import { useEffect, useRef } from "react";
import { ART } from "@/lib/art";
import {
  arcPos, css, hourFromMoon, hourFromSun, mix, moonProgress, skyAt, sunProgress, type RGB, type SkyState,
} from "@/lib/sky";
import { clock, settings, SPEED_SEC_PER_HOUR, type Settings } from "@/lib/store";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
type SpriteKey = keyof typeof ART.sprites;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mod = (a: number, n: number) => ((a % n) + n) % n;

const imgCache = new Map<string, HTMLImageElement>();
function img(src: string) {
  let i = imgCache.get(src);
  if (!i) {
    i = new Image();
    i.decoding = "async";
    i.src = src;
    imgCache.set(src, i);
  }
  return i;
}
const ready = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;

interface Item {
  src: string;
  x: number; // layer-space px
  y: number; // fraction of vh
  h: number; // height px
  w: number;
  bob: number;
  alpha: number;
}
interface Layer {
  depth: number; // parallax & scroll factor
  drift: number; // px/s
  haze: number; // 0..1 toward sky colour
  nightK: number; // multiplier on world tint
  items: Item[];
  span: number; // wrap width
  pad: number;
}

const FAR_ISL: SpriteKey[] = ["isl_c_0", "isl_c_1", "isl_c_3", "isl_c_4", "isl_c_6", "isl_c_7", "isl_a_5", "isl_a_3", "isl_b_2"];
const MID_ISL: SpriteKey[] = ["isl_a_0", "isl_a_1", "isl_a_2", "isl_a_4", "isl_a_6", "isl_a_7", "isl_b_0", "isl_b_1", "isl_b_3", "isl_b_4", "isl_b_5"];
const WISPS: SpriteKey[] = ["cloud_b_0", "cloud_b_2", "cloud_b_3", "cloud_b_5", "cloud_b_7"];
const PUFFS: SpriteKey[] = ["cloud_a_0", "cloud_a_1", "cloud_a_2", "cloud_a_3", "cloud_a_4", "cloud_a_5", "cloud_a_6", "cloud_b_1", "cloud_b_4", "cloud_b_6"];

function sprite(k: SpriteKey) {
  return ART.sprites[k];
}

function buildScene(vw: number, vh: number): Layer[] {
  const r = rng(7);
  const mobile = vw < 760;
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const mk = (keys: readonly SpriteKey[], n: number, span: number, hMin: number, hMax: number, yMin: number, yMax: number, alpha = 1): Item[] => {
    const items: Item[] = [];
    for (let i = 0; i < n; i++) {
      const s = sprite(pick(keys));
      const h = (hMin + r() * (hMax - hMin)) * vh;
      // stratified x so things don't clump
      const x = ((i + r() * 0.8) / n) * span;
      items.push({ src: s.src, x, y: yMin + r() * (yMax - yMin), h, w: (h * s.w) / s.h, bob: r() * Math.PI * 2, alpha });
    }
    return items;
  };
  const cloudItems = (keys: readonly SpriteKey[], n: number, span: number, wMin: number, wMax: number, yMin: number, yMax: number, alpha: number) => {
    const items: Item[] = [];
    for (let i = 0; i < n; i++) {
      const s = sprite(pick(keys));
      const w = (wMin + r() * (wMax - wMin)) * vw;
      items.push({ src: s.src, x: ((i + r() * 0.7) / n) * span, y: yMin + r() * (yMax - yMin), w, h: (w * s.h) / s.w, bob: r() * 6.28, alpha });
    }
    return items;
  };
  const span = (k: number) => vw * k;
  const L: Layer[] = [];
  // far wisps + far islands
  const farSpan = span(1.8);
  L.push({
    depth: 0.12, drift: 5, haze: 0.5, nightK: 1, span: farSpan, pad: vw * 0.4,
    items: [
      ...cloudItems(WISPS, mobile ? 4 : 7, farSpan, 0.18, 0.4, 0.12, 0.55, 0.75),
      ...mk(FAR_ISL, mobile ? 6 : 11, farSpan, 0.045, 0.1, 0.3, 0.72),
    ],
  });
  const midSpan = span(2.2);
  L.push({
    depth: 0.35, drift: 11, haze: 0.34, nightK: 1, span: midSpan, pad: vw * 0.4,
    items: mk(MID_ISL, mobile ? 4 : 7, midSpan, 0.11, 0.21, 0.5, 0.8),
  });
  // hero layer placeholder (filled at draw time)
  L.push({ depth: 0.6, drift: 0, haze: 0.05, nightK: 0.82, span: vw, pad: 0, items: [] });
  // cloud sea (near)
  const nearSpan = span(2);
  const sea = cloudItems(PUFFS, mobile ? 10 : 16, nearSpan, 0.2, 0.36, 0.9, 1.0, 1);
  L.push({ depth: 0.95, drift: 18, haze: 0.08, nightK: 0.9, span: nearSpan, pad: vw * 0.5, items: sea });
  return L;
}

/* ------------------------------------------------------------------ */
/* celestial bodies                                                    */
/* ------------------------------------------------------------------ */
function drawSunVector(c: CanvasRenderingContext2D, x: number, y: number, R: number, alt: number, t: number) {
  const warm: RGB = mix([255, 150, 70], [255, 236, 170], Math.min(1, alt * 1.6));
  // halo
  let g = c.createRadialGradient(x, y, R * 0.6, x, y, R * 7);
  g.addColorStop(0, css(warm, 0.5));
  g.addColorStop(0.2, css(warm, 0.22));
  g.addColorStop(0.5, css(warm, 0.07));
  g.addColorStop(1, css(warm, 0));
  c.fillStyle = g;
  c.fillRect(x - R * 7, y - R * 7, R * 14, R * 14);
  // rays
  c.save();
  c.translate(x, y);
  c.rotate(t * 0.05);
  c.fillStyle = css(warm, 0.22);
  for (let i = 0; i < 12; i++) {
    c.rotate((Math.PI * 2) / 12);
    c.beginPath();
    c.moveTo(-R * 0.16, R * 1.25);
    c.lineTo(0, R * (2.1 + 0.25 * Math.sin(t * 1.3 + i)));
    c.lineTo(R * 0.16, R * 1.25);
    c.fill();
  }
  c.restore();
  // rings + disc
  g = c.createRadialGradient(x, y, R * 0.9, x, y, R * 1.6);
  g.addColorStop(0, css(warm, 0.45));
  g.addColorStop(1, css(warm, 0));
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, R * 1.6, 0, 7); c.fill();
  g = c.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
  g.addColorStop(0, "#fffbe6");
  g.addColorStop(0.7, css(mix([255, 230, 150], warm, 0.4)));
  g.addColorStop(1, css(mix([255, 200, 110], warm, 0.6)));
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
}

function drawMoonVector(c: CanvasRenderingContext2D, x: number, y: number, R: number, sky: RGB) {
  let g = c.createRadialGradient(x, y, R * 0.8, x, y, R * 6);
  g.addColorStop(0, "rgba(190,210,255,0.28)");
  g.addColorStop(1, "rgba(190,210,255,0)");
  c.fillStyle = g;
  c.fillRect(x - R * 6, y - R * 6, R * 12, R * 12);
  c.save();
  c.beginPath(); c.arc(x, y, R, 0, 7); c.clip();
  g = c.createRadialGradient(x - R * 0.35, y - R * 0.35, R * 0.1, x, y, R);
  g.addColorStop(0, "#fffbee"); g.addColorStop(1, "#e3dcc4");
  c.fillStyle = g; c.fillRect(x - R, y - R, R * 2, R * 2);
  c.fillStyle = "rgba(170,165,190,0.45)";
  for (const [cx, cy, cr] of [[-0.35, -0.2, 0.22], [0.25, 0.3, 0.16], [0.1, -0.45, 0.1], [-0.15, 0.45, 0.12], [0.45, -0.1, 0.09]]) {
    c.beginPath(); c.arc(x + cx * R, y + cy * R, cr * R, 0, 7); c.fill();
  }
  // phase shadow (waxing gibbous)
  c.fillStyle = css(mix(sky, [10, 14, 40], 0.4), 0.78);
  c.beginPath(); c.arc(x - R * 1.35, y - R * 0.15, R * 1.05, 0, 7); c.fill();
  c.restore();
}

const PX_N = 16;
function drawPixelBody(c: CanvasRenderingContext2D, x: number, y: number, R: number, kind: "sun" | "moon", t: number, sky: RGB) {
  const s = (R * 2.2) / PX_N;
  const ox = x - (PX_N * s) / 2, oy = y - (PX_N * s) / 2;
  // chunky glow squares
  const glow = kind === "sun" ? "255,190,90" : "190,210,255";
  for (let k = 3; k >= 1; k--) {
    c.fillStyle = `rgba(${glow},${0.07 * k})`;
    const e = (4 - k) * s * 2.2;
    c.fillRect(ox - e, oy - e + s * 2, PX_N * s + e * 2, PX_N * s + e * 2 - s * 4);
    c.fillRect(ox - e + s * 2, oy - e, PX_N * s + e * 2 - s * 4, PX_N * s + e * 2);
  }
  const ctr = (PX_N - 1) / 2;
  for (let j = 0; j < PX_N; j++)
    for (let i = 0; i < PX_N; i++) {
      const d = Math.hypot(i - ctr, j - ctr) / ctr;
      if (d > 1.02) continue;
      let col: string;
      if (kind === "sun") {
        col = d > 0.86 ? "#f08a2c" : d > 0.66 ? "#ffb43c" : d > 0.4 ? "#ffd65e" : "#fff2a8";
        if ((i + j + Math.floor(t * 2)) % 7 === 0 && d > 0.5 && d < 0.86) col = "#ffe47a";
      } else {
        col = d > 0.86 ? "#b8b4c8" : d > 0.55 ? "#e6e1cf" : "#f7f3e4";
        const crater = (i * 7 + j * 13) % 23 === 0 || (i === 5 && j === 6) || (i === 6 && j === 6) || (i === 10 && j === 10) || (i === 9 && j === 4);
        if (crater && d < 0.86) col = "#c9c3b0";
        if (i < 6 && d < 1.02 && Math.hypot(i - ctr + 6, j - ctr) / ctr < 0.95) col = css(mix(sky, [20, 24, 60], 0.5), 0.85);
      }
      c.fillStyle = col;
      c.fillRect(Math.floor(ox + i * s), Math.floor(oy + j * s), Math.ceil(s), Math.ceil(s));
    }
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */
export default function SkyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;

    let vw = 0, vh = 0, scale = 1, layers: Layer[] = [];
    let S: Settings = settings.get();
    let hour = clock.get().hour;
    let lastPush = 0, lastWritten = hour;
    let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
    let scrollY = window.scrollY;
    let drag: null | "sun" | "moon" = null;
    let hover = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // load the selected hero first, then world sprites; other heroes load on demand
    img(ART.hero[S.hero as keyof typeof ART.hero].src);
    Object.values(ART.sprites).forEach((s) => img(s.src));

    // stars
    let stars: { x: number; y: number; r: number; p: number; s: number; big: boolean }[] = [];
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = 4;
    const flies = Array.from({ length: 22 }, (_, i) => ({ a: i * 2.39, r: 0.2 + ((i * 37) % 10) / 14, s: 0.3 + ((i * 13) % 7) / 10, p: i }));
    let birds: { x: number; y: number; v: number; n: number; ph: number } | null = null;
    let nextBirds = 3;

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const pixel = S.render === "pixel";
      scale = pixel ? 1 / 3 : Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, off]) {
        c.width = Math.round(vw * scale);
        c.height = Math.round(vh * scale);
      }
      canvas.style.imageRendering = pixel ? "pixelated" : "auto";
      ctx.imageSmoothingEnabled = octx.imageSmoothingEnabled = !pixel;
      ctx.imageSmoothingQuality = octx.imageSmoothingQuality = "high";
      layers = buildScene(vw, vh);
      const r = rng(3);
      const n = Math.round((vw * vh) / (vw < 760 ? 5200 : 4200));
      stars = Array.from({ length: n }, () => ({
        x: r() * vw, y: Math.pow(r(), 1.4) * vh * 0.85, r: 0.5 + r() * 1.3, p: r() * 6.28, s: 0.6 + r() * 2.4, big: r() < 0.04,
      }));
    }

    function heroBox() {
      const h = ART.hero[S.hero as keyof typeof ART.hero];
      const mobile = vw < 760;
      let cx: number, top: number, maxW: number, maxH: number;
      if (mobile) { cx = 0.5 * vw; top = Math.max(0.5 * vh, 400); maxW = 1.0 * vw; maxH = 0.56 * vh; }
      else if (S.layout === "center") { cx = 0.5 * vw; top = 0.4 * vh; maxW = 0.46 * vw; maxH = 0.66 * vh; }
      else { cx = 0.635 * vw; top = 0.17 * vh; maxW = 0.4 * vw; maxH = 0.86 * vh; }
      const k = Math.min(maxW / h.w, maxH / h.h);
      // portrait sprites carry a long waterfall: let them run into the cloud sea
      return { h, w: h.w * k, hh: h.h * k, x: cx - (h.w * k) / 2, y: top };
    }

    function bodies(hr: number) {
      const R = Math.max(18, Math.min(vw, vh) * 0.038);
      const sp = sunProgress(hr), mp = moonProgress(hr);
      return {
        R,
        sun: sp === null ? null : { ...arcPos(sp, vw, vh), p: sp },
        moon: mp === null ? null : { ...arcPos(mp, vw, vh), p: mp },
      };
    }

    function drawLayer(L: Layer, sky: SkyState, t: number, heroItem?: { src: string; x: number; y: number; w: number; h: number }) {
      octx.setTransform(scale, 0, 0, scale, 0, 0);
      octx.globalCompositeOperation = "source-over";
      octx.clearRect(0, 0, vw, vh);
      const px = (smx - 0.5) * -40 * L.depth;
      const py = (smy - 0.5) * -14 * L.depth - scrollY * L.depth * 0.55;
      const drift = reduced ? 0 : t * L.drift;
      let drew = false;
      for (const it of L.items) {
        const im = img(it.src);
        if (!ready(im)) continue;
        const x = mod(it.x - drift + px, L.span + L.pad) - L.pad * 0.5 - it.w * 0.5;
        if (x > vw || x + it.w < 0) continue;
        const bob = reduced ? 0 : Math.sin(t * 0.5 + it.bob) * it.h * 0.025;
        const y = it.y * vh - it.h * 0.5 + py + bob;
        if (y > vh || y + it.h < 0) continue;
        octx.globalAlpha = it.alpha;
        octx.drawImage(im, x, y, it.w, it.h);
        drew = true;
      }
      if (heroItem) {
        const im = img(heroItem.src);
        if (ready(im)) {
          octx.globalAlpha = 1;
          octx.drawImage(im, heroItem.x + px, heroItem.y + py, heroItem.w, heroItem.h);
          drew = true;
        }
      }
      octx.globalAlpha = 1;
      if (!drew) return { px, py };
      // atmospheric haze + time-of-day relight — only on drawn pixels
      octx.globalCompositeOperation = "source-atop";
      if (L.haze > 0.005) {
        octx.fillStyle = css(mix(sky.mid, sky.bot, 0.55), L.haze);
        octx.fillRect(0, 0, vw, vh);
      }
      const ta = sky.tintAmt * L.nightK;
      if (ta > 0.005) {
        octx.fillStyle = css(sky.tint, ta);
        octx.fillRect(0, 0, vw, vh);
      }
      octx.globalCompositeOperation = "source-over";
      ctx.drawImage(off, 0, 0, vw, vh);
      return { px, py };
    }

    let raf = 0, last = performance.now(), T = 0;
    function frame(now: number) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      T += dt;
      smx += (mx - smx) * Math.min(1, dt * 3);
      smy += (my - smy) * Math.min(1, dt * 3);

      const sph = SPEED_SEC_PER_HOUR[S.speed];
      if (!drag && Number.isFinite(sph)) hour = (hour + dt / sph) % 24;
      if (now - lastPush > 120 || drag) {
        lastPush = now;
        lastWritten = hour;
        clock.set({ hour, dragging: !!drag });
      }

      const sky = skyAt(hour);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, vh);
      g.addColorStop(0, css(sky.top));
      g.addColorStop(0.55, css(sky.mid));
      g.addColorStop(1, css(sky.bot));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, vw, vh);

      // stars
      if (sky.stars > 0.01) {
        for (const s of stars) {
          const a = sky.stars * (0.45 + 0.55 * Math.sin(T * s.s + s.p) ** 2) * (1 - s.y / vh / 1.1);
          ctx.fillStyle = `rgba(255,248,230,${a})`;
          if (s.big) {
            const L = s.r * 4 * (0.7 + 0.3 * Math.sin(T * 2 + s.p));
            ctx.fillRect(s.x - L, s.y - 0.5, L * 2, 1);
            ctx.fillRect(s.x - 0.5, s.y - L, 1, L * 2);
          }
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
        // shooting star
        nextShoot -= dt;
        if (!shooting && nextShoot < 0 && sky.stars > 0.6 && !reduced) {
          shooting = { x: vw * (0.2 + Math.random() * 0.7), y: vh * Math.random() * 0.3, vx: -(500 + Math.random() * 400), vy: 220 + Math.random() * 120, life: 1 };
          nextShoot = 5 + Math.random() * 9;
        }
        if (shooting) {
          const s = shooting;
          s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 1.2;
          const tl = 0.16;
          const lg = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tl, s.y - s.vy * tl);
          lg.addColorStop(0, `rgba(255,255,255,${Math.max(0, s.life) * sky.stars})`);
          lg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = lg; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * tl, s.y - s.vy * tl); ctx.stroke();
          if (s.life <= 0) shooting = null;
        }
      }

      // sun & moon
      const B = bodies(hour);
      const pix = S.celestial === "pixel";
      const lift = (d: "sun" | "moon") => (drag === d ? 1.12 : hover ? 1.05 : 1);
      if (B.moon) {
        if (pix) drawPixelBody(ctx, B.moon.x, B.moon.y, B.R * 0.85 * lift("moon"), "moon", T, sky.mid);
        else drawMoonVector(ctx, B.moon.x, B.moon.y, B.R * 0.85 * lift("moon"), sky.mid);
      }
      if (B.sun) {
        const alt = Math.sin(B.sun.p * Math.PI);
        if (pix) drawPixelBody(ctx, B.sun.x, B.sun.y, B.R * lift("sun"), "sun", T, sky.mid);
        else drawSunVector(ctx, B.sun.x, B.sun.y, B.R * lift("sun"), alt, T);
        // horizon bloom when low
        if (alt < 0.45) {
          const bl = ctx.createRadialGradient(B.sun.x, vh * 0.85, 0, B.sun.x, vh * 0.85, vw * 0.6);
          bl.addColorStop(0, `rgba(255,150,80,${0.28 * (1 - alt / 0.45)})`);
          bl.addColorStop(1, "rgba(255,150,80,0)");
          ctx.fillStyle = bl; ctx.fillRect(0, 0, vw, vh);
        }
      }

      // world layers
      const hb = heroBox();
      const heroItem = { src: hb.h.src, x: hb.x, y: hb.y + (reduced ? 0 : Math.sin(T * 0.6) * vh * 0.008), w: hb.w, h: hb.hh };
      drawLayer(layers[0], sky, T);
      drawLayer(layers[1], sky, T);

      // birds (day) — between mid and hero
      if (sky.stars < 0.05 && !reduced) {
        nextBirds -= dt;
        if (!birds && nextBirds < 0) {
          birds = { x: -60, y: vh * (0.18 + Math.random() * 0.25), v: 55 + Math.random() * 30, n: 3 + Math.floor(Math.random() * 4), ph: Math.random() * 6 };
          nextBirds = 14 + Math.random() * 16;
        }
      }
      if (birds) {
        birds.x += birds.v * dt;
        ctx.strokeStyle = css(mix([30, 30, 50], sky.top, 0.25), 0.8);
        ctx.lineWidth = 1.6; ctx.lineCap = "round";
        for (let i = 0; i < birds.n; i++) {
          const bx = birds.x - i * 26 - (i % 2) * 8, by = birds.y + (i % 2 ? 10 : -4) * Math.ceil(i / 2) + Math.sin(T * 1.3 + i) * 3;
          const f = Math.sin(T * 9 + i * 1.7 + birds.ph) * 5;
          ctx.beginPath();
          ctx.moveTo(bx - 8, by - f); ctx.quadraticCurveTo(bx - 4, by - 3 - f * 0.3, bx, by);
          ctx.quadraticCurveTo(bx + 4, by - 3 - f * 0.3, bx + 8, by - f);
          ctx.stroke();
        }
        if (birds.x - birds.n * 30 > vw) birds = null;
      }

      const { px, py } = drawLayer(layers[2], sky, T, heroItem);

      // night lights: windows + fireflies
      const night = Math.min(1, sky.stars * 1.2 + sky.tintAmt * 0.6) * (sky.stars > 0 || sky.tintAmt > 0.25 ? 1 : 0);
      if (night > 0.02) {
        ctx.globalCompositeOperation = "lighter";
        for (const [gx, gy] of hb.h.glows) {
          const x = heroItem.x + px + gx * hb.w, y = heroItem.y + py + gy * hb.hh;
          const R = hb.w * 0.06 * (1 + 0.04 * Math.sin(T * 3));
          const wg = ctx.createRadialGradient(x, y, 0, x, y, R);
          wg.addColorStop(0, `rgba(255,200,110,${0.85 * night})`);
          wg.addColorStop(0.25, `rgba(255,170,80,${0.35 * night})`);
          wg.addColorStop(1, "rgba(255,150,60,0)");
          ctx.fillStyle = wg; ctx.fillRect(x - R, y - R, R * 2, R * 2);
        }
        if (sky.stars > 0.3) {
          const fa = (sky.stars - 0.3) / 0.7;
          for (const f of flies) {
            const ang = f.a + T * f.s * 0.4;
            const x = heroItem.x + px + hb.w * (0.5 + Math.cos(ang) * 0.42 * f.r + Math.sin(T * 0.7 + f.p) * 0.03);
            const y = heroItem.y + py + hb.hh * (0.16 + Math.sin(ang * 1.3) * 0.08 * f.r) - Math.abs(Math.sin(T * 0.9 + f.p)) * hb.hh * 0.06;
            const a = fa * (0.35 + 0.65 * Math.max(0, Math.sin(T * (1.5 + f.s) + f.p)));
            const R = 9;
            const fg = ctx.createRadialGradient(x, y, 0, x, y, R);
            fg.addColorStop(0, `rgba(230,255,150,${a})`);
            fg.addColorStop(1, "rgba(200,255,120,0)");
            ctx.fillStyle = fg; ctx.fillRect(x - R, y - R, R * 2, R * 2);
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      drawLayer(layers[3], sky, T);

      raf = requestAnimationFrame(frame);
    }

    // ---- interaction --------------------------------------------------
    function hit(x: number, y: number) {
      const B = bodies(hour);
      const r = B.R * 1.9;
      if (B.sun && Math.hypot(x - B.sun.x, y - B.sun.y) < r) return "sun" as const;
      if (B.moon && Math.hypot(x - B.moon.x, y - B.moon.y) < r) return "moon" as const;
      return null;
    }
    function scrub(x: number) {
      const p = (x / vw - 0.05) / 0.9;
      hour = drag === "sun" ? hourFromSun(p) : hourFromMoon(p);
    }
    const onDown = (e: PointerEvent) => {
      const h = hit(e.clientX, e.clientY);
      if (!h) return;
      drag = h;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / vw; my = e.clientY / vh;
      if (drag) { scrub(e.clientX); return; }
      const h = hit(e.clientX, e.clientY);
      hover = !!h;
      canvas.style.cursor = h ? "grab" : "default";
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      canvas.style.cursor = "grab";
      clock.set({ hour, dragging: false });
    };
    const onWinMove = (e: PointerEvent) => { mx = e.clientX / vw; my = e.clientY / vh; };
    const onScroll = () => { scrollY = window.scrollY; };

    const unsubClock = clock.subscribe(() => {
      const c = clock.get();
      if (Math.abs(c.hour - lastWritten) > 1e-6 && !drag) { hour = c.hour; lastWritten = c.hour; }
    });
    const unsubSettings = settings.subscribe(() => {
      const prev = S;
      S = settings.get();
      if (prev.render !== S.render) resize();
    });

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onWinMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      unsubClock(); unsubSettings();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onWinMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return <canvas ref={ref} className="sky-canvas" aria-hidden="true" />;
}
