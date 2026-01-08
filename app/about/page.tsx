"use client";

import ParallaxBackground from "@/components/ParallaxBackground";
import Navigation from "@/components/Navigation";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <ParallaxBackground />

      <div className="content-overlay">
        <div className="top-nav-container">
          <Navigation isHomePage={false} />
        </div>

        <div className="content-main">
          <div className="about-scroll-container">
            <img
              src="/assets/Scroll (Large).png"
              alt="Scroll"
              className="about-scroll-image"
            />
            <div className="about-content">
              <div className="about-photo-container">
                <Image
                  src="/assets/photo_of_me.jpg"
                  alt="Artemios Kayas"
                  className="about-photo"
                  width={300}
                  height={400}
                />
              </div>
              <div className="about-text">
                <p>
                  I&apos;m a developer and innovator who loves building at the intersection of Full-Stack Engineering and Applied AI. I&apos;m currently the Lead Developer behind ClassChat, a custom RAG framework used by faculty at Harvard and Boston University, and I recently led the team that created Learn Wyrm, which took home the &ldquo;Most Innovative Project&rdquo; award out of 60+ entries. Whether I&apos;m shipping code for global companies, at a giant digital consulting firm, or winning hackathons at MIT and Boston University, I&apos;m obsessed with turning complex ideas into tech that actually makes an impact.
                </p>
                <p>
                  My technical toolkit is centered around Next.js, Python, and AI Application, but I&apos;m a builder at heart who isn&apos;t afraid to dive into the deep end of the product life cycle. When I&apos;m not at my keyboard, you&apos;ll usually find me hiking, producing music, or training in Muay Thai. I&apos;m always looking for the next challenge—whether that&apos;s engineering high-precision computer vision models or building gamified fitness apps that push the boundaries of what&apos;s possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}