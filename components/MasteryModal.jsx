"use client";

import { X, CheckCircle2, Trophy, RotateCcw, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MasteryModal({
  isOpen,
  onClose,
  categoriesWithTopics = [],
  masteredIds = new Set(),
  onResetMastery,
  onSelectTopic,
}) {
  const totalTopics = categoriesWithTopics.reduce((acc, c) => acc + c.topics.length, 0);
  const masteredCount = masteredIds.size;
  const percentage = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px] font-sans" dir="rtl">
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full max-w-xl rounded-2xl border border-[#E6E0D5] bg-[#FFFFFF] shadow-2xl p-6 overflow-hidden flex flex-col space-y-6 z-10 text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#181A20]">
                    کارنامه تسلط بر اطلس مهندسی ری‌اکت
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    گزارش پیشرفت یادگیری به تفکیک شاخه‌های دانش
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#181A20] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Progress Stat Box */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-emerald-800 flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>میزان تسلط کلی:</span>
                </span>
                <div className="text-2xl font-black text-[#181A20] font-mono">
                  {masteredCount} از {totalTopics} مفهوم
                  <span className="text-sm text-emerald-700 mr-2">({percentage}٪)</span>
                </div>
              </div>

              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 flex items-center justify-center font-mono font-bold text-sm text-[#181A20] shrink-0 bg-white shadow-2xs">
                {percentage}٪
              </div>
            </div>

            {/* Per-Branch Breakdown */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="text-xs font-mono text-[#6B7280] pb-1">پیشرفت بر روی شاخه‌های ۹‌گانه:</div>
              {categoriesWithTopics.map((category) => {
                const lineTotal = category.topics.length;
                const lineMastered = category.topics.filter((t) => masteredIds.has(t.id)).length;
                const linePercent = lineTotal > 0 ? Math.round((lineMastered / lineTotal) * 100) : 0;

                return (
                  <div
                    key={category.id}
                    className="p-3 rounded-xl border border-[#E6E0D5] bg-[#FAF8F5] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#181A20]">{category.name}</span>
                      <span className="font-mono text-[#6B7280]">
                        {lineMastered} / {lineTotal} ({linePercent}٪)
                      </span>
                    </div>

                    {/* Progress bar line */}
                    <div className="w-full h-1.5 rounded-full bg-[#E6E0D5] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-emerald-500 to-sky-500 rounded-full transition-all duration-300"
                        style={{ width: `${linePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#F0EBE1] pt-4 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (confirm("آیا از بازنشانی وضعیت یادگیری تمام مباحث اطمینان دارید؟")) {
                    onResetMastery();
                  }
                }}
                className="text-[#6B7280] hover:text-rose-600 flex items-center gap-1 transition-colors font-mono cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ریست کارنامه</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#181A20] hover:bg-[#2D333F] text-white font-semibold transition-all cursor-pointer shadow-xs"
              >
                بستن و ادامه یادگیری
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
