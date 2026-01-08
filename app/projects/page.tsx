"use client";

import ParallaxBackground from "@/components/ParallaxBackground";
import Navigation from "@/components/Navigation";
import ProjectModal from "@/components/ProjectModal";
import Image from "next/image";
import { projects, Project } from "@/data/projects";
import { useState } from "react";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  return (
    <>
      <ParallaxBackground />

      <div className="content-overlay">
        <div className="top-nav-container">
          <Navigation isHomePage={false} />
        </div>

        <div className="content-main">
          <div className="projects-container">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <h2 className="project-title">{project.title}</h2>
                <div
                  className="scroll-container"
                  onClick={() => handleProjectClick(project)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src="/assets/Scroll (Hole.png"
                    alt="Scroll"
                    className="scroll-image"
                  />
                  <div className="scroll-hole-content">
                    <Image
                      src={project.image}
                      alt={project.title}
                      className="project-image"
                      fill
                      sizes="(max-width: 768px) 60vw, 30vw"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}