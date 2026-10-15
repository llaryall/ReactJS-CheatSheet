"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";

export default function IsometricWindowVisualizer() {
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-44 sm:w-52 h-36 sm:h-40 flex items-center justify-center select-none"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Soft Background Radial Light */}
        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-sky-400/20 via-indigo-300/15 to-purple-300/20 blur-2xl pointer-events-none -z-10" />

        {/* Ambient floating blue spheres */}
        <motion.div
          animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500/80 to-sky-300/60 shadow-md shadow-blue-500/30 border border-white/60"
        />

        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-2 -right-3 w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500/70 to-purple-400/60 shadow-sm border border-white/60"
        />

        {/* Isometric 3D Window Container */}
        <div
          className="relative w-36 sm:w-40 h-28 sm:h-32 rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#0284C7] to-[#1D4ED8] p-0.5 shadow-xl shadow-sky-600/25 flex flex-col justify-between overflow-hidden"
          style={{ transform: "rotateX(12deg) rotateY(-18deg) rotateZ(3deg)" }}
        >
          {/* Top Window Bar */}
          <div className="h-5 bg-sky-900/30 backdrop-blur-md px-2.5 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            </div>
            <span className="text-[8px] font-mono text-white/70">sync</span>
          </div>

          {/* Central Glass Portal with Rotating Refresh Loop */}
          <div className="flex-1 bg-white/10 backdrop-blur-sm flex items-center justify-center relative">
            <RefreshCw className="w-9 h-9 text-white drop-shadow-md animate-[spin_12s_linear_infinite]" />
            {/* Subtle inner ring */}
            <div className="absolute w-14 h-14 rounded-full border border-white/30 animate-pulse pointer-events-none" />
          </div>

          {/* Bottom Window Accent */}
          <div className="h-1.5 bg-gradient-to-r from-sky-300 to-indigo-400" />
        </div>

        {/* Isometric 3D Floating Blue Cube (State Block) */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1 -left-1 w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] border border-white/60 shadow-lg shadow-sky-900/20 flex items-center justify-center text-white"
          style={{ transform: "rotateX(20deg) rotateY(-15deg)" }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>

        {/* Small floating accent cube */}
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-2 left-3 w-6 h-6 rounded-lg bg-white/90 border border-white/90 shadow-md backdrop-blur-md"
          style={{ transform: "rotateX(15deg) rotateY(-20deg)" }}
        />
      </motion.div>
    </div>
  );
}
