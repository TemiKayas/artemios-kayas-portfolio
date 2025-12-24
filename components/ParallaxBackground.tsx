"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ParallaxBackground() {
  return (
    <div className="parallax-container">
      {/* Sky gradient background */}
      <div className="sky-gradient" />

      {/* Clouds layer - slower */}
      <motion.div
        className="parallax-layer clouds-layer"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          duration: 180,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Image
          src="/assets/Clouds.png"
          alt="Clouds"
          className="parallax-image"
          width={5000}
          height={1080}
          priority
          unoptimized
        />
        <Image
          src="/assets/Clouds.png"
          alt="Clouds"
          className="parallax-image"
          width={5000}
          height={1080}
          unoptimized
        />
      </motion.div>

      {/* Islands layer - faster */}
      <motion.div
        className="parallax-layer islands-layer"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Image
          src="/assets/Islands.png"
          alt="Floating Islands"
          className="parallax-image"
          width={5000}
          height={1080}
          priority
          unoptimized
        />
        <Image
          src="/assets/Islands.png"
          alt="Floating Islands"
          className="parallax-image"
          width={5000}
          height={1080}
          unoptimized
        />
      </motion.div>
    </div>
  );
}
