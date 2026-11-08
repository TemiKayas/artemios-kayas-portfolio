"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULTS, LABELS, OPTIONS, type Settings, updateSetting, useSettings, settings, clock } from "@/lib/store";

export default function Lab() {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shuffle = () => {
    (Object.keys(OPTIONS) as (keyof Settings)[]).forEach((k) => {
      if (k === "speed") return;
      const opts = OPTIONS[k] as readonly string[];
      updateSetting(k, opts[Math.floor(Math.random() * opts.length)] as never);
    });
  };
  const reset = () => (Object.keys(DEFAULTS) as (keyof Settings)[]).forEach((k) => updateSetting(k, DEFAULTS[k] as never));
  const share = async () => {
    const url = new URL(location.href);
    url.searchParams.set("t", clock.get().hour.toFixed(2));
    Object.entries(settings.get()).forEach(([k, v]) => v !== DEFAULTS[k as keyof Settings] && url.searchParams.set(k, v));
    url.hash = "";
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="lab">
      <button className="lab__toggle glass" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="lab-panel">
        <span aria-hidden>✦</span> Lab<span className="lab__toggle-label">&nbsp;· design variants</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="lab-panel"
            className="lab__panel glass"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lab__head">
              <strong>Design lab</strong>
              <span>Try every variant live</span>
            </div>
            {(Object.keys(OPTIONS) as (keyof Settings)[]).map((k) => (
              <fieldset key={k} className="lab__row">
                <legend>{LABELS[k].title}</legend>
                <div className="lab__chips">
                  {(OPTIONS[k] as readonly string[]).map((v) => (
                    <button
                      key={v}
                      className={s[k] === v ? "is-on" : ""}
                      aria-pressed={s[k] === v}
                      onClick={() => updateSetting(k, v as never)}
                    >
                      {LABELS[k].values[v]}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="lab__actions">
              <button onClick={shuffle}>🎲 Shuffle</button>
              <button onClick={reset}>Reset</button>
              <button onClick={share}>{copied ? "Copied!" : "Copy link"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
