"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ShieldCheck, ArrowRight, Box, Repeat, ShieldAlert, Zap } from "lucide-react";
import { GOTCHAS_LIST } from "./GotchaRadarCard";

export default function AllGotchasModal({
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
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Production Gotchas & Anti-Patterns
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Silent traps that bypass typecheckers and crash under real concurrency
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

          {/* Gotchas List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {GOTCHAS_LIST.map((gotcha, idx) => {
              const Icon = gotcha.icon;
              return (
                <div
                  key={gotcha.id}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-amber-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900">
                            {gotcha.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {gotcha.dangerLevel} Risk
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {gotcha.desc} • {gotcha.category}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectTopic({ slug: gotcha.slug, title: gotcha.title });
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-xs font-semibold text-blue-600 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Explore topic</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                    <div>
                      <strong className="text-rose-950 font-bold block mb-0.5">The failure mode:</strong>
                      <span className="text-slate-600 leading-relaxed">{gotcha.gotchaExplanation}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-100">
                      <strong className="text-emerald-900 font-bold block mb-0.5">The production fix:</strong>
                      <span className="text-slate-700 font-mono text-[11px] leading-relaxed">{gotcha.solution}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Verified against React 18 & 19 production codebases</span>
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
