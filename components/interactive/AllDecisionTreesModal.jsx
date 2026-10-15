"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, ArrowRight } from "lucide-react";
import { DECISION_TREES } from "./DecisionTree";

export default function AllDecisionTreesModal({
  isOpen,
  onClose,
  onSelectTopic,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-sans" dir="ltr">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="relative w-full max-w-3xl rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col space-y-6 z-10 text-left max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Architectural Decision Trees
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual flowcharts answering real-world React architectural trade-offs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trees Catalog */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {DECISION_TREES.map((tree, idx) => (
              <div
                key={tree.id}
                className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
                      Tree #{idx + 1}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 mt-0.5">
                      {tree.subtitle}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Starting question: &quot;{tree.rootQuestion}&quot;
                    </p>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    2 Main Branches
                  </span>
                </div>

                {/* Micro preview of branches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-800 text-[11px] block">
                      Branch A: {tree.branchA.label}
                    </span>
                    <span className="text-emerald-700 font-medium text-[11px]">
                      ➔ {tree.branchA.outcomeTitle} {tree.branchA.outcomeDetail}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-800 text-[11px] block">
                      Branch B: {tree.branchB.label}
                    </span>
                    <span className="text-blue-700 font-medium text-[11px]">
                      ➔ {tree.branchB.subQuestion} (Context / Lift state)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>More flowcharts added continuously across topics</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
