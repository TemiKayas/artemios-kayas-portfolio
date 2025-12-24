"use client";

import ParallaxBackground from "@/components/ParallaxBackground";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <>
      <ParallaxBackground />

      {/* Content overlay - centered navigation only */}
      <div className="content-overlay">
        <div className="home-nav-container">
          <Navigation isHomePage={true} />
        </div>
      </div>
    </>
  );
}