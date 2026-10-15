"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, AlertCircle, Info, ArrowRight, ExternalLink } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const COMPARISON_EXAMPLES = [
  {
    id: 1,
    title: "Code Comparison",
    subtitle: "See the difference.",
    badLabel: "✕ Common Mistake",
    badCode: `useEffect(() => {
  fetchData();
}, []);`,
    goodLabel: "✓ Best Practice",
    goodCode: `useEffect(() => {
  const controller =
    new AbortController();
  fetchData(controller);

  return () =>
    controller.abort();
}, [query]);`,
    footerNote: "Always handle cleanup for async operations.",
  },
  {
    id: 2,
    title: "Code Comparison",
    subtitle: "State batching & updater.",
    badLabel: "✕ Stale Snapshot",
    badCode: `const addThree = () => {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  // Result: count + 1 !
};`,
    goodLabel: "✓ Atomic Updater",
    goodCode: `const addThree = () => {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
  // Result: count + 3 ✓
};`,
    footerNote: "Use the updater function when new state depends on previous state.",
  },
  {
    id: 3,
    title: "Code Comparison",
    subtitle: "Derived state vs useEffect.",
    badLabel: "✕ Redundant Effect",
    badCode: `useEffect(() => {
  setFiltered(
    items.filter(
      i => i.match(query)
    )
  );
}, [items, query]);`,
    goodLabel: "✓ Direct Render",
    goodCode: `// Calculated directly
// during render:
const filtered = items
  .filter(
    i => i.match(query)
  );`,
    footerNote: "Never synchronize derived state in an effect. Calculate it during render.",
  },
];

export default function CodeComparison({ onOpenAllComparisons }) {
  const [index, setIndex] = useState(0);
  const current = COMPARISON_EXAMPLES[index] || COMPARISON_EXAMPLES[0];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % COMPARISON_EXAMPLES.length);
  };

  return (
    <div
      className="w-full h-full rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-white/80 p-5 sm:p-6 shadow-[0_15px_40px_-5px_rgba(30,41,59,0.05)] text-left font-sans flex flex-col justify-between"
      dir="ltr"
    >
      {/* Header matching Reference */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{current.title}</h4>
              <p className="text-[11px] text-slate-500">{current.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Next example"
          >
            <span>Next ({index + 1}/{COMPARISON_EXAMPLES.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Side-by-side Columns matching Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
          {/* Left: Common Mistake */}
          <div className="flex flex-col space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold w-fit">
              <span>{current.badLabel}</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#1E2230] overflow-hidden text-left flex-1 min-h-[145px]">
              <SyntaxHighlighter
                language="javascript"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: "0.85rem",
                  background: "#1E2230",
                  fontSize: "0.75rem",
                  lineHeight: "1.52",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {current.badCode}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Right: Best Practice */}
          <div className="flex flex-col space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold w-fit">
              <span>{current.goodLabel}</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#1E2230] overflow-hidden text-left flex-1 min-h-[145px]">
              <SyntaxHighlighter
                language="javascript"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: "0.85rem",
                  background: "#1E2230",
                  fontSize: "0.75rem",
                  lineHeight: "1.52",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {current.goodCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Banner matching Reference + Gateway link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 truncate mr-2">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-[11px] font-medium truncate">{current.footerNote}</span>
        </div>

        {onOpenAllComparisons && (
          <button
            type="button"
            onClick={onOpenAllComparisons}
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>All Comparisons</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
