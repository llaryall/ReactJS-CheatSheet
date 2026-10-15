"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function HeroCanvasVisualizer() {
  const containerRef = useRef(null);
  const [pulseCount, setPulseCount] = useState(1);
  const [activeElement, setActiveElement] = useState(null);

  // Mouse tilt tracking with smooth spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  // Layer parallax depths
  const layer1X = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);
  const layer1Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-14, 14]), springConfig);
  const layer2X = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig);
  const layer2Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig);

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

  const triggerStatePulse = () => {
    setPulseCount((c) => c + 1);
    setActiveElement("state");
    setTimeout(() => setActiveElement(null), 1200);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[480px] h-[340px] sm:h-[380px] flex items-center justify-center select-none cursor-crosshair perspective-1000"
    >
      {/* 3D Tilted Abstract Canvas */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Layer 0: Ambient Gentle Aura */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-sky-100/50 via-purple-100/30 to-amber-100/40 blur-3xl pointer-events-none -z-10" />

        {/* Layer 1: Background SVG Geometric Conduits */}
        <motion.svg
          style={{ x: layer1X, y: layer1Y }}
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          {/* Outer Component Boundary Ring */}
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke="#EAE4D9"
            strokeWidth="1"
            strokeDasharray="4 6"
            className="opacity-70"
          />

          {/* Render Orbit Ring */}
          <motion.circle
            cx="200"
            cy="200"
            r="95"
            fill="none"
            stroke="#E2DBD0"
            strokeWidth="1.5"
            animate={activeElement === "state" ? { stroke: ["#BAE6FD", "#0284C7", "#E2DBD0"], strokeWidth: [1.5, 2.5, 1.5] } : {}}
            transition={{ duration: 1 }}
          />

          {/* Dynamic Reactive Current Beziers connecting nodes */}
          <path
            d="M 120 130 Q 200 170 280 140"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            opacity="0.6"
          />
          <path
            d="M 280 140 Q 250 250 170 270"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            opacity="0.6"
          />
          <path
            d="M 170 270 Q 140 200 120 130"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            opacity="0.6"
          />
        </motion.svg>

        {/* Layer 2: Central Reactive Core (Virtual DOM & Fiber) */}
        <motion.div
          animate={activeElement === "state" ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ x: layer1X, y: layer1Y, translateZ: 30 }}
          className="absolute z-10 w-28 h-28 rounded-full bg-white/90 border border-[#E0D8CB] shadow-lg shadow-[#1C1917]/5 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mb-1.5 animate-pulse" />
          <div className="text-[11px] font-bold text-[#181A20] font-sans tracking-tight">
            Virtual DOM
          </div>
          <div className="text-[9px] font-mono text-[#6B7280]">
            Render #{pulseCount}
          </div>
        </motion.div>

        {/* Layer 3: Floating Reactive Satellite 1 — State Nucleus (Interactive Click!) */}
        <motion.div
          style={{ x: layer2X, y: layer2Y, translateZ: 60 }}
          onClick={triggerStatePulse}
          className="absolute top-10 right-14 z-20 cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="px-3.5 py-2 rounded-2xl bg-white border border-[#D5EAD8] shadow-md shadow-emerald-900/5 flex items-center gap-2 hover:border-emerald-400 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="text-right">
              <div className="text-[11px] font-bold text-[#181A20] font-sans">
                State
              </div>
              <div className="text-[9px] font-mono text-emerald-700">
                count: {pulseCount} (کلیک)
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Layer 3: Floating Reactive Satellite 2 — Props Conduit */}
        <motion.div
          style={{ x: layer1X, y: layer2Y, translateZ: 45 }}
          className="absolute top-12 left-10 z-20 pointer-events-none"
        >
          <div className="px-3 py-1.5 rounded-2xl bg-white/95 border border-[#BAE6FD] shadow-md shadow-sky-900/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
            <div className="text-right">
              <div className="text-[11px] font-bold text-[#181A20] font-sans">
                Props
              </div>
              <div className="text-[9px] font-mono text-sky-700">
                Unidirectional Flow
              </div>
            </div>
          </div>
        </motion.div>

        {/* Layer 3: Floating Reactive Satellite 3 — Effect Boundary */}
        <motion.div
          style={{ x: layer2X, y: layer1Y, translateZ: 50 }}
          className="absolute bottom-10 left-20 z-20 pointer-events-none"
        >
          <div className="px-3 py-1.5 rounded-2xl bg-white/95 border border-[#DDD6FE] shadow-md shadow-purple-900/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <div className="text-right">
              <div className="text-[11px] font-bold text-[#181A20] font-sans">
                Side Effects
              </div>
              <div className="text-[9px] font-mono text-purple-700">
                Cleanup & Sync
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subtle Floating Organic Watermark / Badge */}
        <div className="absolute -bottom-2 right-12 z-10 px-2.5 py-1 rounded-full bg-[#FAF8F5]/90 border border-[#E6E0D5] text-[10px] font-mono text-[#8C93A0] pointer-events-none">
          حرکت ماوس: شیفت تعاملی لایه‌ها
        </div>
      </motion.div>
    </div>
  );
}
