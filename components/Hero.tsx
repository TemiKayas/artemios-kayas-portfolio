"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSettings, useClock } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const s = useSettings();
  const { hour } = useClock();
  const [hinted, setHinted] = useState(false);
  const isDay = hour >= 5.5 && hour <= 19.5;

  useEffect(() => {
    const t = setTimeout(() => setHinted(true), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="top" className={`hero hero--${s.layout} type-${s.type}`}>
      <div className="hero__copy">
        <motion.p
          className="hero__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          Full-stack engineer · Applied AI
        </motion.p>
        <h1 className="hero__title">
          {["Artemios", "Kayas"].map((w, i) => (
            <motion.span
              key={w}
              className="hero__word"
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease, delay: 0.2 + i * 0.12 }}
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="hero__lede"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.55 }}
        >
          I build products where full-stack engineering meets applied AI, from RAG tutors used at Harvard to an
          award-winning learning game.
        </motion.p>
        <motion.div
          className="hero__ctas"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.7 }}
        >
          <a href="#work" className="btn btn--primary">See my work</a>
          <a href="#about" className="btn btn--ghost">About me</a>
        </motion.div>
      </div>

      <motion.p
        className="hero__hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: hinted ? 1 : 0 }}
        transition={{ duration: 1 }}
        aria-hidden
      >
        <span className="hero__hint-dot" /> Drag the {isDay ? "sun" : "moon"} to change the time
      </motion.p>

      <a href="#work" className="hero__scroll" aria-label="Scroll to work">
        <span />
      </a>
    </section>
  );
}
