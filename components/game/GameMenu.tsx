"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { SPRITES, spriteSrc, type SpriteName } from "@/lib/game/sprites";
import {
  ACHIEVEMENTS, markInspected, resetProgress, setSetting, dismissToast,
  useGameClock, useGameSettings, useInspected, useToasts, useUnlocked, type LogoStyle, type Speed,
} from "@/lib/game/state";
import { sfx } from "@/lib/game/sound";
import { formatHour, phaseName } from "@/lib/sky";

const RESUME = "https://drive.google.com/file/d/1KOEd-aniA0YYHQN1Ezyx9Cc8d3t7FcS_/view";
const LINKEDIN = "https://www.linkedin.com/in/artemios-kayas/";
const GITHUB = "https://github.com/TemiKayas";

type Screen = "main" | "projects" | "about" | "achievements" | "contact" | "settings";
const SCREENS: Screen[] = ["main", "projects", "about", "achievements", "contact", "settings"];

const SPLASHES = [
  "Now with 100% more RAG!",
  "Grounded. Never hallucinated.",
  "Try dragging the sun!",
  "Hackathon tested!",
  "Ships on Fridays (carefully).",
  "97% of max weekly points!",
  "Built with Next.js!",
  "Also trains Muay Thai!",
  "Catch a falling star!",
  "Made with real pixels!",
];

/* ------------------------------------------------------------------ */
/* pixel image helper                                                  */
/* ------------------------------------------------------------------ */
function Px({ name, scale = 2, alt = "", className = "" }: { name: SpriteName; scale?: number; alt?: string; className?: string }) {
  const [w, h] = SPRITES[name];
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={spriteSrc(name)} width={w * scale} height={h * scale} alt={alt} className={`px ${className}`} draggable={false} />;
}

const rarity = (p: Project) =>
  p.featured ? { label: "Legendary", cls: "r-legendary" } : p.badge ? { label: "Epic", cls: "r-epic" } : { label: "Rare", cls: "r-rare" };
const itemSprite = (p: Project) => `item_${p.image.split("/").pop()!.replace(".webp", "")}` as SpriteName;

/* ------------------------------------------------------------------ */
/* menu list with keyboard navigation                                  */
/* ------------------------------------------------------------------ */
interface Item { label: string; onSelect: () => void; hint?: string; danger?: boolean }
function MenuList({ items, autoFocus = true, small = false }: { items: Item[]; autoFocus?: boolean; small?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (autoFocus) refs.current[0]?.focus({ preventScroll: true }); }, [autoFocus]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = (idx + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      setIdx(n); refs.current[n]?.focus(); sfx.tick();
    }
  };
  return (
    <ul className={`menu ${small ? "menu--small" : ""}`} role="menu" onKeyDown={onKey}>
      {items.map((it, i) => (
        <li key={it.label} role="none">
          <button
            ref={(el) => { refs.current[i] = el; }}
            role="menuitem"
            className={`menu__item ${it.danger ? "menu__item--danger" : ""}`}
            onMouseEnter={() => { if (idx !== i) { setIdx(i); sfx.tick(); } }}
            onFocus={() => setIdx(i)}
            onClick={() => { sfx.unlock(); it.onSelect(); }}
          >
            {it.label}
            {it.hint && <span className="menu__hint">{it.hint}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children, onBack, wide = false }: { title: string; children: React.ReactNode; onBack: () => void; wide?: boolean }) {
  return (
    <section className={`screen ${wide ? "screen--wide" : ""}`} aria-label={title}>
      <h2 className="screen__title">{title}</h2>
      <div className="panel">{children}</div>
      <MenuList items={[{ label: "Back", onSelect: onBack }]} autoFocus={false} small />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* screens                                                             */
/* ------------------------------------------------------------------ */
function Projects({ onBack }: { onBack: () => void }) {
  const inspected = useInspected();
  const [hover, setHover] = useState<Project | null>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  if (open) {
    const r = rarity(open);
    const paras = (open.description.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [open.description]).reduce<string[]>((acc, s, i) => {
      if (i % 3 === 0) acc.push(s); else acc[acc.length - 1] += s; return acc;
    }, []);
    return (
      <Panel title="Inspect" onBack={() => { sfx.back(); setOpen(null); }} wide>
        <div className="inspect">
          <div className="inspect__media">
            <div className="frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={open.image} alt={`${open.title} screenshot`} />
            </div>
            <div className="inspect__stack">
              <h4>Crafted with</h4>
              <ul className="slots slots--mini">
                {open.tech.map((t) => <li key={t} className="slot slot--text">{t}</li>)}
              </ul>
            </div>
          </div>
          <div className="inspect__info">
            <div className="inspect__head">
              <Px name={itemSprite(open)} scale={2} />
              <div>
                <h3 className={`inspect__name ${r.cls}`}>{open.title}</h3>
                <p className="inspect__rarity">{r.label} {open.badge ? `· ${open.badge}` : ""}</p>
                {open.role && <p className="inspect__role">{open.role}</p>}
              </div>
            </div>
            <p className="inspect__flavor">&ldquo;{open.summary}&rdquo;</p>
            <div className="inspect__text">{paras.map((p, i) => <p key={i}>{p.trim()}</p>)}</div>
            {open.link && (
              <a className="pbtn pbtn--gold" href={open.link} target="_blank" rel="noopener noreferrer" onClick={() => sfx.select()}>
                {open.link.includes("github.com") ? "View on GitHub" : "Visit project"} ↗
              </a>
            )}
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Projects" onBack={onBack}>
      <p className="panel__hint">Hover an item to read it. Click to inspect. ({inspected.size}/{projects.length} inspected)</p>
      <ul className="slots" onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}>
        {projects.map((p) => {
          const r = rarity(p);
          return (
            <li key={p.id}>
              <button
                className={`slot ${r.cls} ${inspected.has(p.id) ? "is-seen" : ""}`}
                onMouseEnter={() => { setHover(p); sfx.tick(); }}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p)}
                onBlur={() => setHover(null)}
                onClick={() => { sfx.select(); markInspected(p.id); setHover(null); setOpen(p); }}
                aria-label={`${p.title}: ${p.summary}`}
              >
                <Px name={itemSprite(p)} scale={2} />
                {!inspected.has(p.id) && <span className="slot__new">NEW</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {hover && (
        <div className="tooltip" style={{ left: mouse.x + 18, top: mouse.y + 18 }} role="tooltip">
          <p className={`tooltip__name ${rarity(hover).cls}`}>{hover.title}</p>
          {hover.badge && <p className="tooltip__badge">★ {hover.badge}</p>}
          <p className="tooltip__line">{hover.summary}</p>
          <p className="tooltip__stat">+{hover.tech.length} tech: {hover.tech.slice(0, 3).join(", ")}{hover.tech.length > 3 ? "…" : ""}</p>
          <p className="tooltip__muted">{rarity(hover).label} · Click to inspect</p>
        </div>
      )}
    </Panel>
  );
}

function About({ onBack }: { onBack: () => void }) {
  const [real, setReal] = useState(false);
  const [frame, setFrame] = useState(0);
  useEffect(() => { const t = setInterval(() => setFrame((f) => (f + 1) % 4), 220); return () => clearInterval(t); }, []);
  const walk: SpriteName[] = ["player_walk0", "player_idle", "player_walk1", "player_idle"];
  return (
    <Panel title="About Me" onBack={onBack} wide>
      <div className="char">
        <div className="char__left">
          <div className="frame frame--portrait">
            {real
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src="/art/portrait.webp" alt="Artemios Kayas" className="char__photo" />
              : <Px name="portrait" scale={3} alt="Pixel portrait of Artemios" />}
          </div>
          <button className="pbtn" onClick={() => { sfx.tick(); setReal((r) => !r); }}>{real ? "Show pixel me" : "Show real photo"}</button>
          <div className="char__walker" aria-hidden><Px name={walk[frame]} scale={1} /></div>
        </div>
        <div className="char__right">
          <h3 className="char__name">Artemios Kayas</h3>
          <p className="char__class">Class: Full-Stack Engineer · Applied AI</p>
          <div className="lore">
            <p>A developer who loves building at the intersection of full-stack engineering and applied AI. Lead developer behind <b>ClassChat</b>, a custom RAG framework used by faculty at Harvard and Boston University. Recently led the team that created <b>Learn Wyrm</b>, which took home &ldquo;Most Innovative Project&rdquo; out of 60+ entries.</p>
            <p>Has shipped code for global companies and a large digital consulting firm, and won hackathons at MIT and Boston University. Obsessed with turning complex ideas into tech that actually makes an impact.</p>
          </div>
          <h4 className="char__h">Equipped</h4>
          <ul className="slots slots--mini">
            {["Next.js", "Python", "AI applications", "TypeScript", "PostgreSQL"].map((t) => <li key={t} className="slot slot--text">{t}</li>)}
          </ul>
          <h4 className="char__h">Active buffs</h4>
          <ul className="buffs">
            <li><span aria-hidden>⛰</span> Hiking</li>
            <li><span aria-hidden>♫</span> Music production</li>
            <li><span aria-hidden>✊</span> Muay Thai</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function Achievements({ onBack }: { onBack: () => void }) {
  const unlocked = useUnlocked();
  const count = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  return (
    <Panel title="Achievements" onBack={onBack}>
      <p className="panel__hint">{count} / {ACHIEVEMENTS.length} unlocked. The career ones are real; the rest are hidden in this world.</p>
      <div className="ach-group"><h4>Career</h4></div>
      <ul className="achs">
        {ACHIEVEMENTS.filter((a) => a.career).map((a) => (
          <li key={a.id} className="ach">
            <Px name={a.icon as SpriteName} scale={1} />
            <div><p className="ach__name">{a.name}</p><p className="ach__desc">{a.desc}</p></div>
          </li>
        ))}
      </ul>
      <div className="ach-group"><h4>Explorer</h4></div>
      <ul className="achs">
        {ACHIEVEMENTS.filter((a) => !a.career).map((a) => {
          const got = unlocked.has(a.id);
          return (
            <li key={a.id} className={`ach ${got ? "" : "ach--locked"}`}>
              <Px name={a.icon as SpriteName} scale={1} />
              <div><p className="ach__name">{got ? a.name : "???"}</p><p className="ach__desc">{a.desc}</p></div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function Contact({ onBack }: { onBack: () => void }) {
  return (
    <Panel title="Contact" onBack={onBack}>
      <p className="panel__hint">Looking for a party member? Always up for a new challenge: a role, a collaboration, or a hackathon team.</p>
      <div className="party">
        {[
          { label: "LinkedIn", sub: "Send a connection request", href: LINKEDIN, icon: "sign" },
          { label: "GitHub", sub: "Browse the source", href: GITHUB, icon: "ach_chest" },
          { label: "Résumé", sub: "Full character sheet", href: RESUME, icon: "ach_gradcap" },
        ].map((l) => (
          <a key={l.label} className="party__card" href={l.href} target="_blank" rel="noopener noreferrer" onMouseEnter={() => sfx.tick()} onClick={() => sfx.select()}>
            <Px name={l.icon as SpriteName} scale={1} />
            <span className="party__label">{l.label}</span>
            <span className="party__sub">{l.sub} ↗</span>
          </a>
        ))}
      </div>
    </Panel>
  );
}

function Settings({ onBack }: { onBack: () => void }) {
  const s = useGameSettings();
  const cycle = <T,>(arr: T[], v: T) => arr[(arr.indexOf(v) + 1) % arr.length];
  const speedLabel: Record<Speed, string> = { normal: "4 min", slow: "12 min", fast: "36 sec", frozen: "Frozen" };
  const logoLabel: Record<LogoStyle, string> = { stone: "Mossy stone", island: "Floating isle", ember: "Ember", gilded: "Gilded" };
  const [confirm, setConfirm] = useState(false);
  return (
    <Panel title="Settings" onBack={onBack}>
      <MenuList
        small
        items={[
          { label: "Sound", hint: s.sound ? "On" : "Off", onSelect: () => { setSetting("sound", !s.sound); sfx.select(); } },
          { label: "Day length", hint: speedLabel[s.speed], onSelect: () => { setSetting("speed", cycle<Speed>(["normal", "slow", "fast", "frozen"], s.speed)); sfx.select(); } },
          { label: "Title logo", hint: logoLabel[s.logo], onSelect: () => { setSetting("logo", cycle<LogoStyle>(["stone", "island", "ember", "gilded"], s.logo)); sfx.select(); } },
          { label: "Pixel size", hint: s.scale === "auto" ? "Auto" : `${s.scale}×`, onSelect: () => { setSetting("scale", cycle<typeof s.scale>(["auto", "2", "3", "4"], s.scale)); sfx.select(); } },
          { label: "Critters", hint: s.critters ? "On" : "Off", onSelect: () => { setSetting("critters", !s.critters); sfx.select(); } },
          { label: confirm ? "Really reset?" : "Reset progress", danger: true, onSelect: () => { if (confirm) { resetProgress(); setConfirm(false); sfx.back(); } else { setConfirm(true); sfx.tick(); } } },
        ]}
      />
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* toasts + hud                                                        */
/* ------------------------------------------------------------------ */
function Toasts() {
  const toasts = useToasts();
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => dismissToast(toasts[0].key), 4200);
    return () => clearTimeout(t);
  }, [toasts]);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.slice(0, 1).map((t) => (
        <div key={t.key} className="toast">
          <Px name={t.a.icon as SpriteName} scale={1} />
          <div><p className="toast__k">Achievement unlocked!</p><p className="toast__name">{t.a.name}</p></div>
        </div>
      ))}
    </div>
  );
}

function Hud() {
  const { hour } = useGameClock();
  const s = useGameSettings();
  const isDay = hour >= 5.5 && hour <= 19.5;
  return (
    <>
      <p className="hud hud--bl">v2.0 · Artemios Kayas · Next.js</p>
      <p className="hud hud--br">
        <span className="hud__time">{isDay ? "☀" : "☾"} {formatHour(hour)} · {phaseName(hour)}</span>
        <span className="hud__tip">Drag the {isDay ? "sun" : "moon"} to change the time</span>
      </p>
      <button className="hud hud--tr sound" onClick={() => { setSetting("sound", !s.sound); sfx.unlock(); }} aria-label={s.sound ? "Mute sounds" : "Unmute sounds"}>
        {s.sound ? "♪ Sound on" : "♪ Muted"}
      </button>
    </>
  );
}

/** fades while the sun/moon is being dragged so you can see it behind the logo */
function Logo({ logo, lw, lh, splash }: { logo: SpriteName; lw: number; lh: number; splash: string | null }) {
  const { dragging } = useGameClock();
  return (
    <div className={`logo ${dragging ? "logo--ghost" : ""}`} style={{ ["--lw" as string]: lw, ["--lh" as string]: lh }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={spriteSrc(logo)} alt="" className="px logo__img" draggable={false} />
      {splash && <span className="splash" key={splash}>{splash}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* root                                                                */
/* ------------------------------------------------------------------ */
export default function GameMenu() {
  const s = useGameSettings();
  const [screen, setScreen] = useState<Screen>("main");
  const [splash, setSplash] = useState(SPLASHES[0]);

  useEffect(() => {
    setSplash(SPLASHES[Math.floor(Math.random() * SPLASHES.length)]);
    const fromHash = () => {
      const h = location.hash.slice(1) as Screen;
      setScreen(SCREENS.includes(h) ? h : "main");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const go = useCallback((sc: Screen) => {
    setScreen(sc);
    history.pushState(null, "", sc === "main" ? location.pathname + location.search : `#${sc}`);
  }, []);
  const back = useCallback(() => { sfx.back(); go("main"); }, [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && screen !== "main") back(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, back]);

  const mainItems: Item[] = useMemo(() => [
    { label: "Projects", onSelect: () => { sfx.select(); go("projects"); } },
    { label: "About Me", onSelect: () => { sfx.select(); go("about"); } },
    { label: "Achievements", onSelect: () => { sfx.select(); go("achievements"); } },
    { label: "Contact", onSelect: () => { sfx.select(); go("contact"); } },
    { label: "Résumé", onSelect: () => { sfx.select(); window.open(RESUME, "_blank", "noopener"); } },
    { label: "Settings", onSelect: () => { sfx.select(); go("settings"); } },
  ], [go]);

  const logo = `logo_${s.logo}` as SpriteName;
  const [lw, lh] = SPRITES[logo];

  return (
    <div className="ui">
      <header className={`title ${screen === "main" ? "" : "title--small"}`}>
        <h1 className="sr-only">Artemios Kayas: Full-Stack Engineer &amp; Applied AI</h1>
        <Logo logo={logo} lw={lw} lh={lh} splash={screen === "main" ? splash : null} />
        {screen === "main" && <p className="subtitle">Full-Stack Engineer · Applied AI</p>}
      </header>

      <main className="stage">
        {screen === "main" && <nav aria-label="Main menu" className="screen screen--main"><MenuList items={mainItems} /></nav>}
        {screen === "projects" && <Projects onBack={back} />}
        {screen === "about" && <About onBack={back} />}
        {screen === "achievements" && <Achievements onBack={back} />}
        {screen === "contact" && <Contact onBack={back} />}
        {screen === "settings" && <Settings onBack={back} />}
      </main>

      <Hud />
      <Toasts />
    </div>
  );
}

