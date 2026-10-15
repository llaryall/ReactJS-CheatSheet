"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ReactAtomVisualizer() {
  const containerRef = useRef(null);
  const [pulseCount, setPulseCount] = useState(0);

  // Mouse tilt tracking with smooth spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 140 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleAtomClick = () => {
    setPulseCount((c) => c + 1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleAtomClick}
      className="relative w-[260px] sm:w-[290px] h-[260px] sm:h-[290px] shrink-0 flex items-center justify-center select-none cursor-pointer"
      style={{ perspective: 1000 }}
    >
      {/* 3D Tilted Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Soft Ambient Radial Backlights */}
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-sky-300/30 via-indigo-300/20 to-purple-300/30 blur-2xl pointer-events-none -z-10" />
        <div className="absolute w-44 h-44 rounded-full bg-cyan-200/40 blur-xl pointer-events-none -z-10" />

        {/* Ambient Floating Glass Bubbles in the background */}
        <motion.div
          animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-300/60 to-purple-400/30 backdrop-blur-md border border-white/60 shadow-md shadow-indigo-500/10"
        />
        <motion.div
          animate={{ y: [5, -5, 5], x: [2, -2, 2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-6 left-4 w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400/40 to-cyan-300/30 backdrop-blur-md border border-white/70 shadow-md shadow-sky-500/10"
        />
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-14 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400/50 to-indigo-300/30 backdrop-blur-sm border border-white/60"
        />

        {/* The 3D Glassmorphic Atom SVG */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full overflow-visible pointer-events-none drop-shadow-[0_20px_40px_rgba(37,99,235,0.15)]"
        >
          <defs>
            {/* Glossy 3D Blue Ring Linear Gradients */}
            <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#2563EB" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#0284C7" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#1D4ED8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="ringGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.95" />
            </linearGradient>

            {/* Specular White Highlight */}
            <linearGradient id="specularGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#BAE6FD" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>

            {/* Central 3D Sphere Radial Gradient */}
            <radialGradient id="sphereCore" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#93C5FD" />
              <stop offset="55%" stopColor="#3B82F6" />
              <stop offset="85%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>

            {/* Core Shadow filter */}
            <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#2563EB" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Group: Rotated Orbit 1 (0 deg horizontal) */}
          <g transform="translate(250, 250) rotate(0) translate(-250, -250)">
            <ellipse
              cx="250"
              cy="250"
              rx="210"
              ry="75"
              fill="none"
              stroke="url(#ringGrad1)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Inner highlight ring */}
            <ellipse
              cx="250"
              cy="250"
              rx="207"
              ry="72"
              fill="none"
              stroke="url(#specularGlow)"
              strokeWidth="3.5"
              opacity="0.8"
            />
          </g>

          {/* Group: Rotated Orbit 2 (+60 deg) */}
          <g transform="translate(250, 250) rotate(60) translate(-250, -250)">
            <ellipse
              cx="250"
              cy="250"
              rx="210"
              ry="75"
              fill="none"
              stroke="url(#ringGrad2)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.92"
            />
            <ellipse
              cx="250"
              cy="250"
              rx="207"
              ry="72"
              fill="none"
              stroke="url(#specularGlow)"
              strokeWidth="3.5"
              opacity="0.8"
            />
          </g>

          {/* Group: Rotated Orbit 3 (-60 deg) */}
          <g transform="translate(250, 250) rotate(-60) translate(-250, -250)">
            <ellipse
              cx="250"
              cy="250"
              rx="210"
              ry="75"
              fill="none"
              stroke="url(#ringGrad3)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.95"
            />
            <ellipse
              cx="250"
              cy="250"
              rx="207"
              ry="72"
              fill="none"
              stroke="url(#specularGlow)"
              strokeWidth="3.5"
              opacity="0.8"
            />
          </g>

          {/* Orbiting Particle Bead 1 */}
          <g transform="translate(250, 250) rotate(0) translate(-250, -250)">
            <circle cx="455" cy="250" r="9" fill="#FFFFFF" filter="url(#coreGlow)" />
            <circle cx="455" cy="250" r="6" fill="#38BDF8" />
          </g>

          {/* Orbiting Particle Bead 2 */}
          <g transform="translate(250, 250) rotate(60) translate(-250, -250)">
            <circle cx="455" cy="250" r="9" fill="#FFFFFF" filter="url(#coreGlow)" />
            <circle cx="455" cy="250" r="6" fill="#60A5FA" />
          </g>

          {/* Orbiting Particle Bead 3 */}
          <g transform="translate(250, 250) rotate(-60) translate(-250, -250)">
            <circle cx="45" cy="250" r="9" fill="#FFFFFF" filter="url(#coreGlow)" />
            <circle cx="45" cy="250" r="6" fill="#818CF8" />
          </g>

          {/* Central 3D Sphere Nucleus */}
          <circle
            cx="250"
            cy="250"
            r="44"
            fill="url(#sphereCore)"
            filter="url(#coreGlow)"
          />

          {/* Specular Glint on Central Sphere */}
          <ellipse
            cx="236"
            cy="234"
            rx="16"
            ry="9"
            transform="rotate(-25 236 234)"
            fill="#FFFFFF"
            opacity="0.75"
          />
        </svg>

        {/* Pulse Ripple Effect on Click */}
        {pulseCount > 0 && (
          <motion.div
            key={pulseCount}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-36 h-36 rounded-full border-2 border-sky-400 pointer-events-none"
          />
        )}
      </motion.div>
    </div>
  );
}
