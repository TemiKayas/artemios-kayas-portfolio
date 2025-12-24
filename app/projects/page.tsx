"use client";

import ParallaxBackground from "@/components/ParallaxBackground";
import Navigation from "@/components/Navigation";

export default function ProjectsPage() {
  return (
    <>
      <ParallaxBackground />

      <div className="content-overlay">
        <div className="top-nav-container">
          <Navigation isHomePage={false} />
        </div>

        <div className="content-main">
          <div className="projects-container">
            {/* Project 1 */}
            <div className="scroll-container">
              <img
                src="/assets/Scroll (Hole).png"
                alt="Scroll"
                className="scroll-image"
              />
              <div className="scroll-hole-content">
                <div className="project-placeholder">
                  <h2 className="text-xl font-bold">Project One</h2>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="scroll-container">
              <img
                src="/assets/Scroll (Hole).png"
                alt="Scroll"
                className="scroll-image"
              />
              <div className="scroll-hole-content">
                <div className="project-placeholder">
                  <h2 className="text-xl font-bold">Project Two</h2>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="scroll-container">
              <img
                src="/assets/Scroll (Hole).png"
                alt="Scroll"
                className="scroll-image"
              />
              <div className="scroll-hole-content">
                <div className="project-placeholder">
                  <h2 className="text-xl font-bold">Project Three</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}