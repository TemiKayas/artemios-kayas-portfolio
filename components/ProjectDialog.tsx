"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/projects";
import { useSettings } from "@/lib/store";

/** Split a long description into readable paragraphs (~3 sentences each), pulling out the "Built with…" line. */
function paragraphs(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  const body = sentences.filter((s) => !/^\s*(This project was )?built with/i.test(s) && !/^\s*LiDARTours was built/i.test(s));
  const out: string[] = [];
  for (let i = 0; i < body.length; i += 3) out.push(body.slice(i, i + 3).join("").trim());
  return out;
}

export default function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const { type } = useSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!project) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
  }, [project, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className={`dialog type-${type}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.article
            className="dialog__panel glass"
            style={{ ["--accent" as string]: project.accent }}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} className="dialog__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <div className="dialog__media">
              <Image src={project.image} alt={`${project.title} screenshot`} fill sizes="(max-width: 900px) 100vw, 880px" priority />
            </div>
            <div className="dialog__body">
              <div className="dialog__meta">
                {project.badge && <span className="badge badge--inline">{project.badge}</span>}
                {project.role && <span className="dialog__role">{project.role}</span>}
              </div>
              <h3 id="dialog-title" className="dialog__title">{project.title}</h3>
              <p className="dialog__summary">{project.summary}</p>
              <div className="dialog__cols">
                <div className="dialog__text">
                  {paragraphs(project.description).map((t, i) => <p key={i}>{t}</p>)}
                </div>
                <aside className="dialog__aside">
                  <h4>Built with</h4>
                  <ul className="tags tags--stack">
                    {project.tech.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  {project.link && (
                    <a className="btn btn--primary btn--block" href={project.link} target="_blank" rel="noopener noreferrer">
                      {project.link.includes("github.com") ? "View on GitHub" : "Visit project"} ↗
                    </a>
                  )}
                </aside>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
