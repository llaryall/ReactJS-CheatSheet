"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeftRight, Check, ArrowRight } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { COMPARISON_EXAMPLES } from "./CodeComparison";

export default function AllComparisonsModal({
  isOpen,
  onClose,
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
          className="relative w-full max-w-4xl rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col space-y-6 z-10 text-left max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Code Comparisons & Production Refactors
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side breakdowns contrasting common anti-patterns with resilient React architecture
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

          {/* Comparisons List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
            {COMPARISON_EXAMPLES.map((item, idx) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                      Scenario #{idx + 1}:
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.subtitle}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {item.footerNote}
                  </span>
                </div>

                {/* Side-by-side code blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Left: Bad */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-block">
                      {item.badLabel}
                    </span>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          padding: "0.85rem",
                          background: "#1E2230",
                          fontSize: "0.76rem",
                          lineHeight: "1.52",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        {item.badCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  {/* Right: Good */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                      {item.goodLabel}
                    </span>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          padding: "0.85rem",
                          background: "#1E2230",
                          fontSize: "0.76rem",
                          lineHeight: "1.52",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        {item.goodCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>All code verified against React 18 & 19 StrictMode</span>
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
