"use client";

import ParallaxBackground from "@/components/ParallaxBackground";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <ParallaxBackground />

      {/* Content overlay - centered navigation only */}
      <div className="content-overlay">
        <div className="home-nav-container">
          <Navigation isHomePage={true} />
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 5,
              ease: [0.45, 0.05, 0.55, 0.95] as [number, number, number, number],
            }}
          >
            <Image
              src="/assets/ArtemiosCloud.png"
              alt="Artemios Cloud"
              className="home-cloud"
              width={800}
              height={400}
              priority
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}