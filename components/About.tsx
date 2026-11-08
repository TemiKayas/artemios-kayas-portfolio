"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;
const reveal = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } };

const FACTS = [
  { k: "Lead Developer", v: "ClassChat, a RAG platform used by faculty at Harvard & BU" },
  { k: "Most Innovative", v: "Learn Wyrm, picked out of 60+ projects" },
  { k: "Hackathons", v: "Wins at MIT & Boston University hackathons" },
];

const LINKS = [
  { label: "Résumé", href: "https://drive.google.com/file/d/1KOEd-aniA0YYHQN1Ezyx9Cc8d3t7FcS_/view" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/artemios-kayas/" },
  { label: "GitHub", href: "https://github.com/TemiKayas" },
];

export default function About() {
  const s = useSettings();
  return (
    <section id="about" className={`section about type-${s.type}`}>
      <div className="about__grid">
        <motion.figure className="about__photo glass" {...reveal} transition={{ duration: 0.9, ease }}>
          <Image src="/art/portrait.webp" alt="Artemios Kayas presenting" fill sizes="(max-width: 900px) 80vw, 380px" />
        </motion.figure>

        <motion.div className="about__copy glass" {...reveal} transition={{ duration: 0.9, ease, delay: 0.1 }}>
          <p className="eyebrow">About</p>
          <h2 className="section__title">Turning complex ideas into tech that makes an impact.</h2>
          <p>
            I&apos;m a developer who loves building where full-stack engineering meets applied AI. I&apos;m the lead
            developer behind <strong>ClassChat</strong>, a custom RAG framework used by faculty at Harvard and Boston
            University, and I recently led the team behind <strong>Learn Wyrm</strong>, which took home &ldquo;Most
            Innovative Project&rdquo; out of 60+ entries. I&apos;ve shipped code for global companies and a large digital
            consulting firm, and I&apos;ve won hackathons at MIT and Boston University.
          </p>
          <p>
            My toolkit centres on Next.js, Python and AI applications, but I&apos;m a builder at heart who likes working
            across the whole product life cycle. Away from the keyboard you&apos;ll find me hiking, producing music, or
            training Muay Thai.
          </p>
          <ul className="facts">
            {FACTS.map((f) => (
              <li key={f.k}>
                <span className="facts__k">{f.k}</span>
                <span className="facts__v">{f.v}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.footer id="contact" className="contact glass" {...reveal} transition={{ duration: 0.9, ease }}>
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="section__title contact__title">Let&rsquo;s build something.</h2>
          <p className="contact__lede">Always up for a new challenge, whether that&rsquo;s a role, a collaboration, or a hackathon team.</p>
        </div>
        <ul className="contact__links">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a className="btn btn--ghost" href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </motion.footer>
      <p className="colophon">© {new Date().getFullYear()} Artemios Kayas · The sky is rendered live. Drag the sun.</p>
    </section>
  );
}
