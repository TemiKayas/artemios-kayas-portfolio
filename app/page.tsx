"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import About from "@/components/About";
import TimeHud from "@/components/TimeHud";
import Lab from "@/components/Lab";
import { hydrateSettings, useSettings } from "@/lib/store";

const SkyCanvas = dynamic(() => import("@/components/SkyCanvas"), { ssr: false });

export default function Home() {
  const s = useSettings();
  useEffect(hydrateSettings, []);
  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => root.style.setProperty("--scroll-k", Math.min(1, window.scrollY / (window.innerHeight * 0.9)).toFixed(3));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`site type-${s.type}`}>
      <div className="sky-fallback" aria-hidden />
      <SkyCanvas />
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
      </main>
      <div className="dock">
        <TimeHud />
        <Lab />
      </div>
    </div>
  );
}
