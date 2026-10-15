"use client";

import { Sparkles, Layers, Hash } from "lucide-react";

export default function InteractiveCategoryList({
  categoriesWithTopics,
  selectedTier = "all",
  onTopicSelect,
}) {
  if (!categoriesWithTopics || categoriesWithTopics.length === 0) {
    return null;
  }

  const getTierBadge = (tier) => {
    switch (tier) {
      case "🟢":
        return {
          dot: "bg-emerald-400",
          text: "مقدماتی",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "🔵":
        return {
          dot: "bg-blue-400",
          text: "رایج",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        };
      case "🟣":
        return {
          dot: "bg-purple-400",
          text: "پیشرفته",
          badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      default:
        return {
          dot: "bg-neutral-400",
          text: "",
          badge: "bg-neutral-800 text-neutral-400 border-neutral-700",
        };
    }
  };

  return (
    <div className="space-y-12">
      {/* Quick Jump Category Strip */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-2.5 bg-[#080B11]/90 backdrop-blur-md border-b border-neutral-900/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[11px] font-mono text-neutral-500 shrink-0 ml-1">
          دسترسی سریع:
        </span>
        {categoriesWithTopics.map((category) => (
          <a
            key={category.id}
            href={`#category-${category.id}`}
            className="shrink-0 px-3 py-1 rounded-lg text-xs font-sans text-neutral-400 hover:text-white bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 transition-all flex items-center gap-1.5"
          >
            <Hash className="w-3 h-3 text-purple-400/80" />
            <span>{category.name}</span>
            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-1 rounded">
              {category.topics.length}
            </span>
          </a>
        ))}
      </div>

      {/* Flat Open Categories Section */}
      <div className="space-y-10">
        {categoriesWithTopics.map((category) => {
          const filteredTopics = category.topics.filter(
            (t) => selectedTier === "all" || t.tier === selectedTier
          );

          if (filteredTopics.length === 0) return null;

          return (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="scroll-mt-28 space-y-4 rounded-3xl border border-neutral-850/80 bg-neutral-950/40 p-5 sm:p-6 backdrop-blur-sm"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-neutral-850/80 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                    #
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-100 font-sans tracking-tight">
                    {category.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                    {filteredTopics.length} موضوع
                  </span>
                </div>
              </div>

              {/* All Topics Visible Grid (No Accordion Hiding!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredTopics.map((topic) => {
                  const isLighthouse =
                    topic.slug?.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
                  const tierInfo = getTierBadge(topic.tier);

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() =>
                        onTopicSelect({
                          ...topic,
                          categoryName: category.name,
                        })
                      }
                      className={`group relative text-right p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 active:scale-[0.99] ${
                        isLighthouse
                          ? "border-purple-500/40 bg-gradient-to-br from-purple-950/20 via-neutral-900/60 to-neutral-950 shadow-lg shadow-purple-950/20 hover:border-purple-400"
                          : "border-neutral-850 bg-[#0C101A]/70 hover:bg-[#111726] hover:border-neutral-700 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="font-semibold text-xs sm:text-sm text-neutral-200 group-hover:text-white transition-colors leading-snug font-sans">
                          {topic.title}
                        </span>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${tierInfo.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tierInfo.dot}`} />
                          <span>{tierInfo.text}</span>
                        </span>
                      </div>

                      {/* Bottom Micro Details */}
                      <div className="flex items-center justify-between w-full pt-1 text-[11px] text-neutral-500 font-mono">
                        {isLighthouse ? (
                          <span className="inline-flex items-center gap-1 text-purple-300 font-semibold text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Lighthouse Edition ⚡</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                            مشاهده اسنیپت و الگو ←
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
