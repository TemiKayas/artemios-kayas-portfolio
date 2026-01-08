"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useNavigation } from "./NavigationProvider";
import { useState, useEffect } from "react";

interface NavigationProps {
  isHomePage?: boolean;
}

export default function Navigation({ isHomePage = false }: NavigationProps) {
  const { shouldAnimate } = useNavigation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const homeScale = isMobile ? 2.2 : 3;

  return (
    <motion.nav
      layout={shouldAnimate ? "position" : false}
      className={isHomePage ? "navigation-home" : "navigation-top"}
      initial={isHomePage ? { scale: homeScale, y: 0 } : { scale: 1, y: 0 }}
      animate={
        isHomePage
          ? { y: [0, -15, 0], scale: homeScale }
          : { y: 0, scale: 1 }
      }
      transition={
        isHomePage
          ? {
              scale: { duration: 0 },
              y: {
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 5,
                ease: [0.45, 0.05, 0.55, 0.95] as [number, number, number, number],
              }
            }
          : { duration: 0.8, ease: "easeInOut" }
      }
    >
      <div className="nav-container">
        <Image
          src="/assets/Nav Text.png"
          alt="Navigation"
          className="nav-image"
          width={600}
          height={120}
          priority
        />

        {/* Clickable areas overlaid on the nav image */}
        <div className="nav-links">
          <Link href="/" className="nav-link nav-link-home">
            <span className="sr-only">Home</span>
          </Link>
          <Link href="/about" className="nav-link nav-link-about">
            <span className="sr-only">About</span>
          </Link>
          <Link href="/projects" className="nav-link nav-link-projects">
            <span className="sr-only">Projects</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}