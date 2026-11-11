import React from "react";
import { motion } from "framer-motion";

/**
 * Creative Hero Section Animation
 * Colorful, vibrant, fully visible animation
 * Positioned exactly behind "Hardware Development" text
 * Extends over image section - completely visible from top to bottom
 */
const HeroBackgroundAnimation = () => {
  return (
    <>
      {/* Main Colorful Orb - Blue to Purple Gradient - Fully Visible Over Entire Section */}
      <motion.div
        className="absolute"
        style={{
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(99, 102, 241, 0.98) 12%, rgba(139, 92, 246, 0.95) 25%, rgba(168, 85, 247, 0.85) 45%, rgba(192, 38, 211, 0.7) 65%, transparent 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 200px rgba(59, 130, 246, 1), 0 0 400px rgba(99, 102, 241, 0.8), 0 0 600px rgba(139, 92, 246, 0.6)",
          filter: "blur(4px)",
          opacity: 1,
          zIndex: 2,
          willChange: "transform",
          pointerEvents: "none",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      
      {/* Inner Cyan Core - Bright Center - Fully Visible */}
      <motion.div
        className="absolute"
        style={{
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "380px",
          height: "380px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 1) 0%, rgba(59, 130, 246, 1) 20%, rgba(99, 102, 241, 0.95) 45%, rgba(139, 92, 246, 0.8) 70%, transparent 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 120px rgba(6, 182, 212, 1), 0 0 240px rgba(59, 130, 246, 0.9), 0 0 360px rgba(99, 102, 241, 0.7)",
          filter: "blur(2px)",
          opacity: 1,
          zIndex: 2,
          willChange: "transform",
          pointerEvents: "none",
        }}
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          rotate: {
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      
      {/* Outer Glow - Multi-color Blend - Extends Over Image */}
      <motion.div
        className="absolute"
        style={{
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "750px",
          height: "750px",
          background: "radial-gradient(circle, transparent 0%, transparent 10%, rgba(6, 182, 212, 0.5) 25%, rgba(59, 130, 246, 0.4) 40%, rgba(139, 92, 246, 0.3) 60%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(8px)",
          opacity: 1,
          zIndex: 2,
          willChange: "transform",
          pointerEvents: "none",
        }}
        animate={{
          rotate: [0, -360],
        }}
        transition={{
          rotate: {
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      
      {/* Accent Particles - Small Colorful Dots - Fully Visible */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            background: i % 2 === 0 
              ? "radial-gradient(circle, rgba(6, 182, 212, 1), rgba(59, 130, 246, 0.95))"
              : "radial-gradient(circle, rgba(139, 92, 246, 1), rgba(192, 38, 211, 0.95))",
            borderRadius: "50%",
            boxShadow: `0 0 20px ${i % 2 === 0 ? 'rgba(6, 182, 212, 1)' : 'rgba(139, 92, 246, 1)'}, 0 0 40px ${i % 2 === 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(139, 92, 246, 0.6)'}`,
            opacity: 1,
            zIndex: 2,
            pointerEvents: "none",
          }}
          animate={{
            x: [
              Math.cos((i * 60) * Math.PI / 180) * 220,
              Math.cos((i * 60) * Math.PI / 180) * 250,
              Math.cos((i * 60) * Math.PI / 180) * 220,
            ],
            y: [
              Math.sin((i * 60) * Math.PI / 180) * 220,
              Math.sin((i * 60) * Math.PI / 180) * 250,
              Math.sin((i * 60) * Math.PI / 180) * 220,
            ],
            scale: [1, 1.4, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </>
  );
};

export default HeroBackgroundAnimation;
