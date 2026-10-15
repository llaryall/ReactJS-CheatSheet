"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Command,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Layers,
  Check,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TopicDetailSheet from "./TopicDetailSheet";
import CommandPalette from "./CommandPalette";
import MasteryModal from "./MasteryModal";

// 4 High-impact practical engineering dilemmas matching reference
const FEATURED_DILEMMAS = [
  {
    title: "When do you actually need useEffect?",
    badge: "AI Gotchas",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
    slug: "useEffect",
    description: "Why over 70% of effect usage in production is an anti-pattern, and how to safely cancel network races with AbortController.",
  },
  {
    title: "State Colocation: Where should state live?",
    badge: "Data Architecture",
    badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
    slug: "usestate",
    description: "Render snapshots, atomic updater functions, and preventing cascade re-renders before reaching for global stores.",
  },
  {
    title: "Why useMemo often hurts performance",
    badge: "Performance & Compiler",
    badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
    slug: "usecallback, usememo",
    description: "The memory tax of memoization, broken reference traps in React.memo, and the paradigm shift with the React Compiler.",
  },
  {
    title: "Modern React 19 forms without state or effects",
    badge: "React 19 Paradigm",
    badgeStyle: "bg-sky-50 text-sky-800 border-sky-200",
    slug: "useactionstate",
    description: "Zero-boilerplate form validation with useActionState and instant millisecond optimistic feedback using useOptimistic.",
  },
];

export default function TopicBrowser({ initialCategories }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMasteryOpen, setIsMasteryOpen] = useState(false);

  // Global shortcut Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load mastered topics from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("react_atlas_mastered_ids");
      if (stored) {
        setMasteredIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleMastered = (topicId) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      try {
        localStorage.setItem("react_atlas_mastered_ids", JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleResetMastery = () => {
    setMasteredIds(new Set());
    try {
      localStorage.removeItem("react_atlas_mastered_ids");
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenTopic = (topic) => {
    setActiveTopic(topic);
    setIsSheetOpen(true);
  };

  // Flattened topics for Command Palette and search
  const allFlattenedTopics = useMemo(() => {
    if (!initialCategories) return [];
    return initialCategories.flatMap((cat) =>
      cat.topics.map((t) => ({ ...t, categoryName: cat.name }))
    );
  }, [initialCategories]);

  // Search filtered results
  const searchResults = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return [];
    return allFlattenedTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(q))
    );
  }, [searchTerm, allFlattenedTopics]);

  const totalTopics = allFlattenedTopics.length;
  const masteryPercentage =
    totalTopics > 0 ? Math.round((masteredIds.size / totalTopics) * 100) : 0;

  return (
    <div className="w-full space-y-20 pb-28 font-sans text-left" dir="ltr">
      {/* 1. Prominent Search Bar */}
      <section className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="relative group">
          <div className="relative flex items-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm hover:border-slate-300 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-50 transition-all p-2">
            <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0 group-focus-within:text-sky-600 transition-colors" />
            <input
              type="text"
              placeholder="Search concepts, hooks, or production gotchas... (Press ⌘ K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans py-1.5"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 transition-colors shrink-0"
              >
                ✕
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 shrink-0">
                <Command className="w-3 h-3" /> K
              </kbd>
            )}
          </div>
        </div>

        {/* Live Search Results Dropdown/List when typing */}
        <AnimatePresence>
          {searchTerm.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-1 max-h-[380px] overflow-y-auto custom-scrollbar"
            >
              <div className="text-[11px] font-mono text-slate-500 px-3 py-1 flex items-center justify-between border-b border-slate-100">
                <span>Search results for &quot;{searchTerm}&quot;</span>
                <span>{searchResults.length} concepts</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No concepts matching your search.
                </div>
              ) : (
                searchResults.map((topic) => {
                  const isMastered = masteredIds.has(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleOpenTopic(topic)}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-sky-500" />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-sky-700 truncate" dir="auto">
                          {topic.title}
                        </span>
                        <span className="text-xs text-slate-400 font-sans">
                          in {topic.categoryName}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors shrink-0" />
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 2. Featured Engineering Dilemmas (The 4 Deep Dive Highlights) */}
      <section className="max-w-5xl mx-auto px-6 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Critical Engineering Decisions</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
              Decisions where AI assistants routinely hallucinate
            </h3>
          </div>
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">
            Battle-tested Mental Models
          </span>
        </div>

        {/* 2x2 Clean Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_DILEMMAS.map((dilemma, idx) => (
            <Link
              key={idx}
              href={`/topic/${encodeURIComponent(dilemma.slug)}`}
              className="group p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-white/90 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${dilemma.badgeStyle}`}>
                    {dilemma.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>

                <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                  {dilemma.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {dilemma.description}
                </p>
              </div>

              <div className="pt-2 text-xs font-mono text-sky-700 font-semibold flex items-center gap-1">
                <span>View interactive breakdown →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Calm & Compact Category Navigation */}
      <section className="max-w-5xl mx-auto px-6 space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Curated React Atlas</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
              Explore the 9 architectural domains of React
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {totalTopics} curated concepts
          </span>
        </div>

        {/* 9 Quiet Category Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {initialCategories.map((category) => {
            const isSelected = selectedCategory?.id === category.id;
            const masteredCount = category.topics.filter((t) => masteredIds.has(t.id)).length;

            return (
              <div
                key={category.id}
                className={`rounded-2xl border transition-all ${
                  isSelected
                    ? "border-slate-900 bg-white shadow-md ring-1 ring-slate-900/10"
                    : "border-slate-200/80 bg-white/90 hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                {/* Category Header Card */}
                <div
                  onClick={() => setSelectedCategory(isSelected ? null : category)}
                  className="p-5 cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 font-sans truncate">
                      {category.name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                      {category.topics.length} topics
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                    <span>Mastery: {masteredCount} of {category.topics.length}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isSelected ? "rotate-180 text-slate-900" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Inline Clean Topic List when opened */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50/70 p-3 space-y-1"
                    >
                      {category.topics.map((topic) => {
                        const isMastered = masteredIds.has(topic.id);
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() =>
                              handleOpenTopic({
                                ...topic,
                                categoryName: category.name,
                              })
                            }
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-sans text-slate-700 hover:text-slate-900 hover:bg-white transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  topic.tier === "🟢"
                                    ? "bg-emerald-500"
                                    : topic.tier === "🔵"
                                    ? "bg-sky-500"
                                    : "bg-purple-500"
                                }`}
                              />
                              <span className="truncate" dir="auto">
                                {topic.title}
                              </span>
                            </div>

                            {isMastered && (
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Slide-over Reader Sheet */}
      <TopicDetailSheet
        topic={activeTopic}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        isMastered={activeTopic ? masteredIds.has(activeTopic.id) : false}
        onToggleMastered={handleToggleMastered}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        topics={allFlattenedTopics}
        onSelectTopic={handleOpenTopic}
      />

      {/* Mastery Dashboard Modal */}
      <MasteryModal
        isOpen={isMasteryOpen}
        onClose={() => setIsMasteryOpen(false)}
        categoriesWithTopics={initialCategories}
        masteredIds={masteredIds}
        onResetMastery={handleResetMastery}
        onSelectTopic={handleOpenTopic}
      />
    </div>
  );
}
