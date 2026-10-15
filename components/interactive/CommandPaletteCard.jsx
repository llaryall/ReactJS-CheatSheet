"use client";

import { useState } from "react";
import { Search, X, Layers, CornerDownLeft, Box, ShieldCheck, Zap } from "lucide-react";

export default function CommandPaletteCard({ onOpenPalette, onSelectTopic }) {
  const [query, setQuery] = useState("stale state");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const defaultItems = [
    {
      id: "stale-closures",
      title: "Stale Closures & State",
      desc: "Common pitfall in useEffect and handlers",
      icon: Box,
      slug: "useEffect",
      active: true,
    },
    {
      id: "use-callback",
      title: "useCallback",
      desc: "Prevent stale closures in callbacks",
      icon: Zap,
      slug: "usecallback, usememo",
      active: false,
    },
    {
      id: "use-ref",
      title: "useRef",
      desc: "Keep mutable values without re-renders",
      icon: Layers,
      slug: "useRef",
      active: false,
    },
    {
      id: "race-conditions",
      title: "Race Conditions",
      desc: "Handle async updates safely",
      icon: ShieldCheck,
      slug: "useEffect",
      active: false,
    },
  ];

  const filteredItems = query.trim() === "stale state" || !query.trim()
    ? defaultItems
    : defaultItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.desc.toLowerCase().includes(query.toLowerCase())
      );

  const handleItemClick = (item, idx) => {
    setSelectedIndex(idx);
    if (onSelectTopic) {
      onSelectTopic({ slug: item.slug, title: item.title });
    }
  };

  return (
    <div
      className="w-full h-full rounded-3xl bg-[#141824] border border-white/10 p-5 sm:p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] text-left font-sans select-none flex flex-col justify-between group transition-all"
      dir="ltr"
    >
      <div>
        {/* Search Input Box matching Reference */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#1D2232] border border-white/10 mb-3 focus-within:border-indigo-500/80 transition-colors">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts or gotchas..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-medium"
            />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Top Results Section matching Reference */}
        <div className="space-y-1">
          <div className="text-[11px] font-mono font-medium text-slate-400 px-1 mb-1.5">
            Top Results
          </div>

          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item, idx)}
                className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl transition-all cursor-pointer ${
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
      </div>

      {/* Footer Key Prompt triggering full palette */}
      <div
        onClick={onOpenPalette}
        className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono cursor-pointer hover:text-slate-200 transition-colors mt-2"
      >
        <span>
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
            ⌘ K
          </kbd>{" "}
          to open command palette
        </span>
      </div>
    </div>
  );
}
