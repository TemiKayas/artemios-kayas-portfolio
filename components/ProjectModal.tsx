"use client";

import { Project } from "@/data/projects";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="modal-container">
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <button className="modal-close" onClick={onClose}>
                ×
              </button>

              {/* Title */}
              <h2 className="modal-title">{project.title}</h2>

              {/* Image */}
              <div className="modal-image-container">
                <Image
                  src={project.image}
                  alt={project.title}
                  className="modal-image"
                  width={800}
                  height={450}
                />
              </div>

              {/* Description */}
              <p className="modal-description">{project.description}</p>

              {/* Link button - conditional */}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-button"
                >
                  Check it out!
                </a>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
