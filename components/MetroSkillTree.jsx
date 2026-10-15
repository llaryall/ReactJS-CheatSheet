"use client";

import { useMemo, useState } from "react";
import { Check, Sparkles, ChevronLeft, Search, Filter, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MetroSkillTree({
  categoriesWithTopics,
  activeTopic,
  onSelectTopic,
  masteredIds = new Set(),
  onToggleMastered,
  searchTerm = "",
  selectedTier = "all",
}) {
  // Active selected category line tab (defaults to first category)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Line theme colors based on category index
  const getLineTheme = (index) => {
    const themes = [
      { id: "emerald", border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500", line: "#10b981", halo: "shadow-emerald-500/20" },
      { id: "cyan", border: "border-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500", line: "#06b6d4", halo: "shadow-cyan-500/20" },
      { id: "purple", border: "border-purple-500", text: "text-purple-400", bg: "bg-purple-500", line: "#a855f7", halo: "shadow-purple-500/20" },
      { id: "blue", border: "border-blue-500", text: "text-blue-400", bg: "bg-blue-500", line: "#3b82f6", halo: "shadow-blue-500/20" },
      { id: "indigo", border: "border-indigo-500", text: "text-indigo-400", bg: "bg-indigo-500", line: "#6366f1", halo: "shadow-indigo-500/20" },
      { id: "amber", border: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500", line: "#f59e0b", halo: "shadow-amber-500/20" },
      { id: "rose", border: "border-rose-500", text: "text-rose-400", bg: "bg-rose-500", line: "#f43f5e", halo: "shadow-rose-500/20" },
      { id: "teal", border: "border-teal-500", text: "text-teal-400", bg: "bg-teal-500", line: "#14b8a6", halo: "shadow-teal-500/20" },
      { id: "violet", border: "border-violet-500", text: "text-violet-400", bg: "bg-violet-500", line: "#8b5cf6", halo: "shadow-violet-500/20" },
    ];
    return themes[index % themes.length];
  };

  const activeCategory = categoriesWithTopics[activeCategoryIndex] || categoriesWithTopics[0];
  const activeLineTheme = getLineTheme(activeCategoryIndex);

  // Filter topics in active line
  const displayedTopics = useMemo(() => {
    if (!activeCategory) return [];

    return activeCategory.topics.filter((topic) => {
      const matchesSearch =
        !searchTerm.trim() ||
        topic.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        activeCategory.name.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesTier = selectedTier === "all" || topic.tier === selectedTier;

      return matchesSearch && matchesTier;
    });
  }, [activeCategory, searchTerm, selectedTier]);

  const getTierIndicator = (tier) => {
    switch (tier) {
      case "🟢":
        return { label: "ریشه", dot: "bg-emerald-400", color: "text-emerald-400" };
      case "🔵":
        return { label: "ساقه", dot: "bg-blue-400", color: "text-blue-400" };
      case "🟣":
        return { label: "سایبان", dot: "bg-purple-400", color: "text-purple-400" };
      default:
        return { label: "", dot: "bg-neutral-400", color: "text-neutral-400" };
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#07090E] border-l border-neutral-850/80 text-right select-none" dir="rtl">
      {/* Category Metro Lines Selector Strip */}
      <div className="shrink-0 p-3 border-b border-neutral-850 bg-[#090D15]/80 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>خطوط نقشه مهارت (Metro Lines)</span>
          </span>
          <span className="text-[11px] text-neutral-500">
            خط {activeCategoryIndex + 1} از {categoriesWithTopics.length}
          </span>
        </div>

        {/* Scrollable Metro Line Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categoriesWithTopics.map((cat, idx) => {
            const isSelected = idx === activeCategoryIndex;
            const theme = getLineTheme(idx);
            const lineMasteredCount = cat.topics.filter((t) => masteredIds.has(t.id)).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryIndex(idx)}
                className={`shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-sans transition-all ${
                  isSelected
                    ? `bg-[#0F1420] ${theme.border} text-white font-semibold shadow-md ${theme.halo}`
                    : "bg-[#090C14] border-neutral-850 text-neutral-400 hover:text-neutral-200 hover:border-neutral-750"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: theme.line }}
                />
                <span className="truncate max-w-[130px]">{cat.name}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {lineMasteredCount}/{cat.topics.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Line Header & Progress */}
      <div className="shrink-0 px-4 py-3 bg-[#0B0F19]/40 border-b border-neutral-850/60 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
              style={{ backgroundColor: activeLineTheme.line }}
            />
            <span>{activeCategory?.name}</span>
          </h3>
          <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
            ایستگاه‌های یادگیری به ترتیب از مفاهیم پایه تا معماری عمیق
          </p>
        </div>

        <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg shrink-0">
          {displayedTopics.length} ایستگاه
        </span>
      </div>

      {/* The Metro Line Vertical Track & Stations List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative space-y-1">
        {displayedTopics.length === 0 ? (
          <div className="text-center py-12 text-xs font-sans text-neutral-500">
            ایستگاهی مطابق با فیلتر در این خط یافت نشد.
          </div>
        ) : (
          <div className="relative pr-6">
            {/* Subway Visual Track Line */}
            <div
              className="absolute right-[11px] top-4 bottom-4 w-1 rounded-full opacity-60 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, ${activeLineTheme.line}, rgba(168, 85, 247, 0.4), rgba(59, 130, 246, 0.2))`,
              }}
            />

            {/* Topic Station Nodes */}
            {displayedTopics.map((topic, index) => {
              const isSelected = activeTopic?.id === topic.id;
              const isMastered = masteredIds.has(topic.id);
              const isLighthouse =
                topic.slug?.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
              const tierInfo = getTierIndicator(topic.tier);

              return (
                <div key={topic.id} className="relative group/station mb-2.5">
                  {/* Station Interactive Node */}
                  <div
                    onClick={() =>
                      onSelectTopic({
                        ...topic,
                        categoryName: activeCategory.name,
                      })
                    }
                    className={`cursor-pointer relative flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? `bg-[#101625] ${activeLineTheme.border} shadow-lg shadow-purple-950/20 text-white font-semibold ring-1 ring-purple-500/30`
                        : "bg-[#0A0E18]/70 border-neutral-850/80 hover:bg-[#0E1321] hover:border-neutral-750 text-neutral-300 hover:text-white"
                    }`}
                  >
                    {/* Track Junction Point (Circle on the track) */}
                    <div
                      className={`absolute -right-[19px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? `bg-white border-purple-400 scale-125 shadow-md shadow-purple-500/50`
                          : isMastered
                          ? "bg-emerald-400 border-emerald-300"
                          : "bg-[#07090E] border-neutral-600 group-hover/station:border-neutral-300"
                      }`}
                    >
                      {isMastered && (
                        <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />
                      )}
                    </div>

                    {/* Station Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-sans truncate">
                          {topic.title}
                        </span>

                        {isLighthouse && (
                          <span className="shrink-0 flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Lighthouse</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-neutral-500">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${tierInfo.dot}`} />
                          <span className={tierInfo.color}>{tierInfo.label}</span>
                        </span>
                        <span>•</span>
                        <span>ایستگاه {index + 1}</span>
                      </div>
                    </div>

                    {/* Mastery Toggle Button */}
                    <button
                      type="button"
                      title={isMastered ? "تسلط یافته" : "علامت‌گذاری به عنوان مسلط"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMastered(topic.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                        isMastered
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isMastered ? "text-emerald-400 fill-emerald-500/20" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
