"use client";

import ParallaxBackground from "@/components/ParallaxBackground";
import Navigation from "@/components/Navigation";

export default function AboutPage() {
  return (
    <>
      <ParallaxBackground />

      <div className="content-overlay">
        <Navigation isHomePage={false} />

        <div className="content-main">
          <div className="scroll-container">
            <img
              src="/assets/Scroll (Large).png"
              alt="Scroll"
              className="scroll-image"
            />
            <div className="scroll-content">
              <h1 className="text-2xl font-bold mb-4">About Me</h1>
              <p>
                I am a passionate developer with a love for creating beautiful
                and functional web experiences. I specialize in front-end
                development with React and Next.js, and I am always looking for
                new ways to push the boundaries of what is possible on the web.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}