"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive("#" + e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <nav className="nav__inner glass" aria-label="Primary">
        <a href="#top" className="nav__brand" aria-label="Artemios Kayas — home">
          <span className="nav__mark" aria-hidden>
            <svg viewBox="0 0 32 32" width="22" height="22">
              <path d="M4 14c3-3 8-4 12-4s9 1 12 4l-3 2-3 6-4 7-3-6-4-3z" fill="#2f4a74" />
              <path d="M4 14c3-3 8-4 12-4s9 1 12 4c-4 1.5-8 2-12 2s-8-.5-12-2z" fill="#9db85a" />
              <path d="M10 12l2-6 2 6zM15 11l2.5-8 2.5 8zM20 12l1.8-5 1.8 5z" fill="#26361c" />
            </svg>
          </span>
          <span className="nav__name">Artemios Kayas</span>
        </a>
        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={active === l.href ? "is-active" : ""}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              className="nav__cta"
              href="https://drive.google.com/file/d/1KOEd-aniA0YYHQN1Ezyx9Cc8d3t7FcS_/view"
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
