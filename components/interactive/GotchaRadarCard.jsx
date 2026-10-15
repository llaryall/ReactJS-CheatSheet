"use client";

import { useState } from "react";
import { AlertTriangle, CornerDownLeft, Box, ShieldAlert, Zap, Repeat, ArrowRight, CheckCircle2 } from "lucide-react";

export const GOTCHAS_LIST = [
  {
    id: "stale-closures",
    title: "Stale Closures & State",
    desc: "Callbacks capture old render state values",
    category: "Hooks & Handlers",
    icon: Box,
    dangerLevel: "High",
    slug: "usestate",
    gotchaExplanation: "Functions close over variables from the render they were defined in. In intervals, timeouts, or async callbacks, reading state directly without functional updater (c => c + 1) reads stale frozen values.",
    solution: "Use updater function setCount(prev => prev + 1) or keep mutable tracker in useRef.",
  },
  {
    id: "infinite-loops",
    title: "Infinite Re-render Loops",
    desc: "New object/array references inside dependencies",
    category: "Dependencies",
    icon: Repeat,
    dangerLevel: "Critical",
    slug: "useEffect",
    gotchaExplanation: "Defining objects or arrays inside component body means a new memory reference is instantiated every render. Passing it to useEffect dependencies triggers infinite execution.",
    solution: "Move objects inside useEffect or extract primitive dependencies ([query] instead of [options]).",
  },
  {
    id: "race-conditions",
    title: "Race Conditions & Fast Clicks",
    desc: "Slow network responses overwrite newer state",
    category: "Async & Network",
    icon: ShieldAlert,
    dangerLevel: "High",
    slug: "useEffect",
    gotchaExplanation: "When a user changes filters rapidly, request #1 can resolve after request #2, writing outdated data into the UI.",
    solution: "Return AbortController abort function in useEffect cleanup to cancel stale network requests.",
  },
  {
    id: "broken-memo",
    title: "Broken Memoization in Memo",
    desc: "Inline functions destroy React.memo isolation",
    category: "Performance",
    icon: Zap,
    dangerLevel: "Medium",
    slug: "usecallback, usememo",
    gotchaExplanation: "React.memo compares props with Object.is. Passing inline arrow functions (() => doSomething()) creates a new reference on each render, forcing re-render of memoized children.",
    solution: "Wrap callback in useCallback or pass primitive IDs down instead of inline lambdas.",
  },
];

export default function GotchaRadarCard({
  onSelectTopic,
  onOpenAllGotchas,
  onOpenPalette,
}) {
  const [selectedGotchaId, setSelectedGotchaId] = useState("stale-closures");
  const selectedGotcha = GOTCHAS_LIST.find((g) => g.id === selectedGotchaId) || GOTCHAS_LIST[0];

  const handleSelect = (gotcha) => {
    setSelectedGotchaId(gotcha.id);
    if (onSelectTopic && gotcha.slug) {
      onSelectTopic({ slug: gotcha.slug, title: gotcha.title });
    }
  };

  return (
    <div
      className="w-full h-full rounded-[2.5rem] bg-[#141824] border border-white/10 p-5 sm:p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] text-left font-sans flex flex-col justify-between group transition-all"
      dir="ltr"
    >
      <div>
        {/* Header matching Reference dark style */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#1D2232] border border-white/10 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-white tracking-tight">Gotcha Radar</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-mono">
            4 Production Traps
          </span>
        </div>

        {/* 4 Interactive Gotchas List matching Reference Cards */}
        <div className="space-y-1.5 mb-2">
          <div className="text-[11px] font-mono font-medium text-slate-400 px-1 mb-1.5 flex items-center justify-between">
            <span>Critical Silent Traps</span>
            <span className="text-[10px] text-slate-500">Click to diagnose</span>
          </div>

          {GOTCHAS_LIST.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedGotchaId;

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#252B3E] border border-indigo-500/50 text-white shadow-sm"
                    : "hover:bg-[#1C2030] border border-transparent text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-indigo-600/40 text-indigo-300 border border-indigo-500/30"
                        : "bg-slate-800/80 text-slate-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <CornerDownLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Selected Gotcha Diagnostic Peek */}
        <div className="p-3 rounded-xl bg-[#1A1F2C] border border-white/5 space-y-1.5 my-2">
          <div className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
            <span>Why it breaks:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
            {selectedGotcha.gotchaExplanation}
          </p>
        </div>
      </div>

      {/* Footer Navigation matching Reference */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <button
          type="button"
          onClick={onOpenPalette}
          className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
            ⌘ K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenAllGotchas}
          className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer font-sans text-xs font-semibold"
        >
          <span>All Anti-Patterns</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
