"use client";

import { Sparkles } from "lucide-react";

export default function SearchedTopicItem({ topic, onTopicClick }) {
  const isLighthouse = topic.slug?.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";

  const getTierBadge = (tier) => {
    switch (tier) {
      case "🟢":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "🔵":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "🟣":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  return (
    <button
      type="button"
      onClick={() => onTopicClick(topic)}
      className="w-full text-right p-3.5 rounded-xl border border-neutral-850 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700 transition-all shadow-sm active:scale-[0.99] group flex items-center justify-between gap-3"
      dir="rtl"
    >
      <div className="flex items-center gap-2.5 truncate flex-1">
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${getTierBadge(topic.tier)}`}>
          {topic.tier}
        </span>
        <span className="text-sm font-semibold text-neutral-200 group-hover:text-white truncate font-sans">
          {topic.title}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isLighthouse && (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Lighthouse</span>
          </span>
        )}
        {topic.categoryName && (
          <span className="text-xs text-neutral-500 font-sans">
            در {topic.categoryName}
          </span>
        )}
      </div>
    </button>
  );
}
