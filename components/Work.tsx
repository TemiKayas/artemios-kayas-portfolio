"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { useSettings } from "@/lib/store";
import ProjectDialog from "./ProjectDialog";

const ease = [0.22, 1, 0.36, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

function Tags({ tech, max = 4 }: { tech: string[]; max?: number }) {
  const shown = tech.slice(0, max);
  return (
    <ul className="tags">
      {shown.map((t) => <li key={t}>{t}</li>)}
      {tech.length > max && <li className="tags__more">+{tech.length - max}</li>}
    </ul>
  );
}

function Card({ p, i, onOpen, variant }: { p: Project; i: number; onOpen: (p: Project) => void; variant: "bento" | "gallery" }) {
  const ref = useRef<HTMLButtonElement>(null);
  // pointer-tracked sheen
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current!.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const big = variant === "bento" && p.featured;
  return (
    <motion.li
      className={`card-wrap ${big ? "card-wrap--feature" : ""}`}
      {...reveal}
      transition={{ duration: 0.8, ease, delay: (i % 3) * 0.08 }}
    >
      <button
        ref={ref}
        className="card glass"
        style={{ ["--accent" as string]: p.accent }}
        onPointerMove={onMove}
        onClick={() => onOpen(p)}
        aria-haspopup="dialog"
      >
        <div className="card__media">
          <Image
            src={p.image}
            alt=""
            fill
            sizes={big ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 33vw"}
            className="card__img"
          />
          {p.badge && <span className="badge">{p.badge}</span>}
        </div>
        <div className="card__body">
          <div className="card__head">
            <h3 className="card__title">{p.title}</h3>
            <span className="card__arrow" aria-hidden>↗</span>
          </div>
          {p.role && <p className="card__role">{p.role}</p>}
          <p className="card__summary">{p.summary}</p>
          <Tags tech={p.tech} />
        </div>
      </button>
    </motion.li>
  );
}

function IndexList({ onOpen }: { onOpen: (p: Project) => void }) {
  const [hover, setHover] = useState<Project | null>(null);
  return (
    <div className="index">
      <ol className="index__list">
        {projects.map((p, i) => (
          <motion.li key={p.id} {...reveal} transition={{ duration: 0.7, ease, delay: i * 0.04 }}>
            <button
              className="index__row"
              onMouseEnter={() => setHover(p)}
              onFocus={() => setHover(p)}
              onClick={() => onOpen(p)}
            >
              <span className="index__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="index__title">{p.title}</span>
              <span className="index__summary">{p.summary}</span>
              <span className="index__badge">{p.badge ?? p.tech[0]}</span>
            </button>
          </motion.li>
        ))}
      </ol>
      <div className="index__preview glass" aria-hidden>
        {projects.map((p) => (
          <Image
            key={p.id}
            src={p.image}
            alt=""
            fill
            sizes="40vw"
            className={`index__img ${(hover ?? projects[0]).id === p.id ? "is-on" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Work() {
  const s = useSettings();
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id="work" className={`section work type-${s.type}`}>
      <motion.header className="section__head" {...reveal} transition={{ duration: 0.9, ease }}>
        <p className="eyebrow">Selected work</p>
        <h2 className="section__title">Things I&rsquo;ve built</h2>
        <p className="section__lede">
          Hackathon winners, products used in real classrooms, and experiments, mostly at the intersection of
          full-stack and AI.
        </p>
      </motion.header>

      {s.work === "index" ? (
        <IndexList onOpen={setOpen} />
      ) : (
        <ul className={`work__grid work__grid--${s.work}`}>
          {projects.map((p, i) => (
            <Card key={p.id} p={p} i={i} onOpen={setOpen} variant={s.work as "bento" | "gallery"} />
          ))}
        </ul>
      )}

      <ProjectDialog project={open} onClose={close} />
    </section>
  );
}
