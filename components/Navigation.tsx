"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigation } from "./NavigationProvider";

interface NavigationProps {
  isHomePage?: boolean;
}

export default function Navigation({ isHomePage = false }: NavigationProps) {
  const { shouldAnimate } = useNavigation();

  // Periodic bounce animation - slower and smoother
  const bounceAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      repeatDelay: 5,
      ease: [0.45, 0.05, 0.55, 0.95], // Custom easing for smoother motion
    },
  };

  return (
    <motion.nav
      layoutId={shouldAnimate ? "main-navigation" : undefined}
      className={isHomePage ? "navigation-home" : "navigation-top"}
      animate={isHomePage ? bounceAnimation : { y: 0 }}
      transition={{
        layout: {
          duration: shouldAnimate ? 1.4 : 0,
          ease: [0.45, 0.05, 0.55, 0.95],
          type: "tween",
        },
      }}
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