"use client";

import { useState } from "react";
import { GitBranch, X, RotateCcw, ArrowRight, ExternalLink } from "lucide-react";

export const DECISION_TREES = [
  {
    id: "state-colocation",
    title: "Decision Tree",
    subtitle: "Choose the right approach for your state.",
    rootQuestion: "Where is the state used?",
    branchA: {
      label: "Single component",
      sublabel: null,
      outcomeTitle: "Use local state",
      outcomeDetail: "(useState)",
      outcomeType: "success",
    },
    branchB: {
      label: "Multiple components",
      subQuestion: "Is it truly shared?",
      yes: {
        label: "Context / Store",
        detail: "(or other solution)",
      },
      no: {
        label: "Lift state up",
        detail: "or composition",
      },
    },
  },
  {
    id: "effect-necessity",
    title: "Decision Tree",
    subtitle: "Do you actually need an Effect?",
    rootQuestion: "What is triggering this logic?",
    branchA: {
      label: "User interaction",
      sublabel: null,
      outcomeTitle: "Put in event handler",
      outcomeDetail: "(onClick / onSubmit)",
      outcomeType: "success",
    },
    branchB: {
      label: "Sync with outside world",
      subQuestion: "Is it pure calculation?",
      yes: {
        label: "Calculate in render",
        detail: "(derived state)",
      },
      no: {
        label: "Use useEffect",
        detail: "with cleanup handler",
      },
    },
  },
  {
    id: "memo-strategy",
    title: "Decision Tree",
    subtitle: "Should you wrap with useMemo / useCallback?",
    rootQuestion: "Why are you memoizing?",
    branchA: {
      label: "Expensive loop / heavy math",
      sublabel: null,
      outcomeTitle: "Profile first!",
      outcomeDetail: "useMemo if > 10ms",
      outcomeType: "caution",
    },
    branchB: {
      label: "Prop passed to child",
      subQuestion: "Is child memoized?",
      yes: {
        label: "Use useCallback",
        detail: "with stable deps",
      },
      no: {
        label: "Skip memoization",
        detail: "child re-renders anyway",
      },
    },
  },
];

export default function DecisionTree({
  title = "Decision Tree",
  subtitle = "Choose the right approach for your state.",
  onClose,
  onOpenAllTrees,
}) {
  const [treeIndex, setTreeIndex] = useState(0);
  const [activeBranch, setActiveBranch] = useState("all"); // 'all' | 'single' | 'shared' | 'yes' | 'no'

  const currentTree = DECISION_TREES[treeIndex] || DECISION_TREES[0];

  const handleReset = () => {
    setActiveBranch("all");
  };

  const handleNextTree = () => {
    setActiveBranch("all");
    setTreeIndex((prev) => (prev + 1) % DECISION_TREES.length);
  };

  return (
    <div
      className="w-full h-full rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-white/80 p-5 sm:p-6 shadow-[0_15px_40px_-5px_rgba(30,41,59,0.05)] text-left font-sans flex flex-col justify-between"
      dir="ltr"
    >
      {/* Card Header matching Reference */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{currentTree.title}</h4>
              <p className="text-[11px] text-slate-500">{currentTree.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeBranch !== "all" && (
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                title="Reset choices"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNextTree}
              className="text-xs font-mono text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next Tree ({treeIndex + 1}/{DECISION_TREES.length})</span>
            </button>
          </div>
        </div>

        {/* Visual Flow Diagram matching Reference image exactly */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          {/* Level 1: Root Question Bubble with speech tail */}
          <div className="relative">
            <div className="px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-900 text-[11px] sm:text-xs font-semibold shadow-2xs">
              {currentTree.rootQuestion}
            </div>
            <div className="w-0.5 h-2 bg-slate-300 mx-auto" />
          </div>

          {/* Level 2: Two Branches */}
          <div className="w-full flex items-start justify-center gap-3 sm:gap-5 relative">
            {/* Branch 1 */}
            <div
              className={`flex-1 flex flex-col items-center space-y-2 transition-opacity ${
                activeBranch === "shared" || activeBranch === "yes" || activeBranch === "no"
                  ? "opacity-35"
                  : "opacity-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveBranch("single")}
                className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  activeBranch === "single"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {currentTree.branchA.label}
              </button>

              <div className="w-0.5 h-2 bg-slate-300" />

              {/* Outcome 1 */}
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs text-center font-medium shadow-2xs transition-all ${
                  activeBranch === "single"
                    ? "bg-emerald-100 border-emerald-400 text-emerald-950 scale-105"
                    : "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                }`}
              >
                <div className="font-bold text-[11px] text-emerald-800">
                  {currentTree.branchA.outcomeTitle}
                </div>
                <div className="text-[10px] text-emerald-700 font-mono">
                  {currentTree.branchA.outcomeDetail}
                </div>
              </div>
            </div>

            {/* Branch 2 */}
            <div
              className={`flex-1 flex flex-col items-center space-y-2 transition-opacity ${
                activeBranch === "single" ? "opacity-35" : "opacity-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveBranch("shared")}
                className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  activeBranch === "shared" || activeBranch === "yes" || activeBranch === "no"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {currentTree.branchB.label}
              </button>

              <div className="w-0.5 h-1.5 bg-slate-300" />

              {/* Sub-Question */}
              <div className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                {currentTree.branchB.subQuestion}
              </div>

              {/* Sub-branches: Yes / No */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {/* Yes Option */}
                <button
                  type="button"
                  onClick={() => setActiveBranch("yes")}
                  className={`flex flex-col items-center space-y-1 cursor-pointer transition-transform ${
                    activeBranch === "yes" ? "scale-105" : ""
                  }`}
                >
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Yes
                  </span>
                  <div
                    className={`px-2 py-1 rounded-xl border text-[10px] font-medium text-center leading-tight ${
                      activeBranch === "yes"
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-bold"
                        : "bg-slate-50/90 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div>{currentTree.branchB.yes.label}</div>
                    <div className="text-[9px] text-slate-500">{currentTree.branchB.yes.detail}</div>
                  </div>
                </button>

                {/* No Option */}
                <button
                  type="button"
                  onClick={() => setActiveBranch("no")}
                  className={`flex flex-col items-center space-y-1 cursor-pointer transition-transform ${
                    activeBranch === "no" ? "scale-105" : ""
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                    No
                  </span>
                  <div
                    className={`px-2 py-1 rounded-xl border text-[10px] font-medium text-center leading-tight ${
                      activeBranch === "no"
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-bold"
                        : "bg-slate-50/90 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div>{currentTree.branchB.no.label}</div>
                    <div className="text-[9px] text-slate-500">{currentTree.branchB.no.detail}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Gateway link */}
      {onOpenAllTrees && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans">
          <span className="text-slate-400">Interactive engineering flows</span>
          <button
            type="button"
            onClick={onOpenAllTrees}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View all Decision Trees</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
