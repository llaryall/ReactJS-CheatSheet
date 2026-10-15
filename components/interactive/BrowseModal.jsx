"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Layers, Check, ArrowRight, Sparkles } from "lucide-react";

export default function BrowseModal({
  isOpen,
  onClose,
  categories = [],
  onSelectTopic,
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  const filteredTopics = useMemo(() => {
    if (!categories) return [];

    let results = [];
    const q = search.toLowerCase().trim();

    categories.forEach((cat) => {
      if (selectedCategory !== "all" && cat.id !== selectedCategory) return;

      cat.topics.forEach((t) => {
        const matchesSearch =
          !q ||
          t.title.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q);

        const matchesTier = selectedTier === "all" || t.tier === selectedTier;

        if (matchesSearch && matchesTier) {
          results.push({
            ...t,
            categoryName: cat.name,
          });
        }
      });
    });

    return results;
  }, [categories, search, selectedCategory, selectedTier]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-sans" dir="ltr">
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col space-y-6 z-10 text-left max-h-[85vh]"
          >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Explore All Topics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse, filter and search through the 90 curated React concepts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by concept, hook, or problem..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Category Pills & Tier Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All 9 Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.topics.length})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedTier("all")}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    selectedTier === "all"
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  All Levels
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier("🟢")}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    selectedTier === "🟢"
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  🟢 Beginner
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier("🔵")}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    selectedTier === "🔵"
                      ? "bg-sky-600 text-white font-bold"
                      : "bg-sky-50 text-sky-800 border-sky-200"
                  }`}
                >
                  🔵 Common
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier("🟣")}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    selectedTier === "🟣"
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-purple-50 text-purple-800 border-purple-200"
                  }`}
                >
                  🟣 Advanced
                </button>
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            <div className="text-xs font-mono text-slate-500 pb-1 flex items-center justify-between">
              <span>Showing {filteredTopics.length} topics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    onSelectTopic(topic);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-2xs text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 truncate">
                      {topic.title}
                    </span>
                    <span className="text-[10px] shrink-0 font-mono text-slate-400">
                      {topic.tier}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-sans truncate">
                    in {topic.categoryName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
