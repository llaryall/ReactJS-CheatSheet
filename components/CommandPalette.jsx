"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Command, Sparkles, AlertCircle, ArrowLeft, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SYMPTOM_INDEX = [
  {
    symptom: "حلقه رندر بی‌نهایت (Infinite Loop / Maximum update depth exceeded)",
    targetSlug: "useEffect",
    tag: "تله پروداکشن",
    recommendation: "آبجکت درون آرایه وابستگی افکت قرار دارد یا setState در افکت بدون شرط صدا زده شده.",
  },
  {
    symptom: "داده‌های متناقض شبکه هنگام سوییچ سریع تب‌ها (Race Condition)",
    targetSlug: "useEffect",
    tag: "باگ هوش مصنوعی",
    recommendation: "نیاز به لغو درخواست قبلی شبکه با استفاده از AbortController درون تابع cleanup افکت.",
  },
  {
    symptom: "مقدار استیت در خط بعدی console.log مقدار قبلی است (Stale State)",
    targetSlug: "useState",
    tag: "مدل ذهنی",
    recommendation: "استیت اسنپ‌شات رندر جاری است؛ برای زنجیره تغییرات از Updater Function استفاده کنید.",
  },
  {
    symptom: "رندرهای اضافی با وجود استفاده از React.memo (Broken Memoization)",
    targetSlug: "usecallback, usememo",
    tag: "پرفورمنس",
    recommendation: "آبجکت یا تابع ورودی به عنوان پراپ در هر رندر رفرنس جدیدی دریافت می‌کند و مقایسه می‌شکند.",
  },
  {
    symptom: "تغییر مقدار متغیر بدون تحریک ریرندر (Renderless Persistent Variable)",
    targetSlug: "useRef",
    tag: "مدیریت حافظه",
    recommendation: "استفاده از useRef به جای useState برای ذخیره شناسه‌های تایمر یا پرچم‌های داخلی.",
  },
  {
    symptom: "رندرهای ناخواسته کل درخت به دلیل تغییر یک فیلد در Context (Context Cascade)",
    targetSlug: "useContext",
    tag: "معماری",
    recommendation: "تفکیک کانتکست‌های با تغییرات بالا از داده‌های ثابت یا سوییچ به Zustand.",
  },
  {
    symptom: "لودینگ، ارور و غیرفعال‌سازی دکمه فرم در ری‌اکت ۱۹ (Actions without Effects)",
    targetSlug: "useActionState",
    tag: "ری‌اکت ۱۹",
    recommendation: "استفاده از useActionState و useOptimistic برای ارسال خودکار و فیدبک میلی‌ثانیه‌ای.",
  },
];

export default function CommandPalette({
  isOpen,
  onClose,
  topics = [],
  onSelectTopic,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    const matchedSymptoms = SYMPTOM_INDEX.filter(
      (item) =>
        !q ||
        item.symptom.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q) ||
        item.targetSlug.toLowerCase().includes(q)
    ).map((item) => ({
      type: "symptom",
      id: `symptom-${item.symptom}`,
      title: item.symptom,
      subtitle: item.recommendation,
      badge: item.tag,
      targetSlug: item.targetSlug,
    }));

    const matchedTopics = topics
      .filter(
        (t) =>
          !q ||
          t.title.toLowerCase().includes(q) ||
          (t.categoryName && t.categoryName.toLowerCase().includes(q))
      )
      .slice(0, 15)
      .map((t) => ({
        type: "topic",
        id: `topic-${t.id}`,
        title: t.title,
        subtitle: t.categoryName ? `در ${t.categoryName}` : "مفهوم ری‌اکت",
        badge: t.tier,
        rawTopic: t,
      }));

    return [...matchedSymptoms, ...matchedTopics];
  }, [query, topics]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleExecute(results[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleExecute = (item) => {
    if (item.type === "topic" && item.rawTopic) {
      onSelectTopic(item.rawTopic);
    } else if (item.type === "symptom" && item.targetSlug) {
      const found = topics.find(
        (t) =>
          t.title.toLowerCase().includes(item.targetSlug.toLowerCase()) ||
          t.slug?.toLowerCase().includes(item.targetSlug.toLowerCase())
      );
      if (found) {
        onSelectTopic(found);
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/35 backdrop-blur-[2px] font-sans" dir="rtl">
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-2xl rounded-2xl border border-[#E6E0D5] bg-[#FFFFFF] shadow-2xl overflow-hidden flex flex-col z-10 text-right"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F0EBE1] bg-[#FAF8F5]">
              <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="جستجوی دردسرها و باگ‌ها (مثلاً: infinite loop، race condition، ریرندر)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent text-sm text-[#181A20] placeholder-[#9CA3AF] focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#E6E0D5] bg-white text-[10px] font-mono text-[#6B7280]">
                ESC
              </kbd>
            </div>

            {/* Quick Hints */}
            <div className="px-4 py-2 border-b border-[#F0EBE1] bg-[#FAF8F5]/60 flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
              <span>کلیدهای ↑ و ↓ برای پیمایش، Enter برای انتخاب</span>
              <span>{results.length} نتیجه پیدا شد</span>
            </div>

            {/* Results List */}
            <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {results.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#6B7280]">
                  موردی یافت نشد. می‌توانید با نام هوک یا باگ جستجو کنید.
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isSymptom = item.type === "symptom";

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleExecute(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`cursor-pointer flex items-center justify-between gap-3 p-3 rounded-xl border transition-all text-right ${
                        isSelected
                          ? "bg-sky-50/80 border-sky-300 text-[#181A20]"
                          : "border-transparent text-[#3E4452] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isSymptom
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {isSymptom ? <AlertCircle className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold truncate">
                              {item.title}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                                isSymptom
                                  ? "bg-amber-100 text-amber-900 border-amber-200"
                                  : "bg-[#F3EFE9] text-[#4A5260] border-[#E6E0D5]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <ArrowLeft
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? "text-sky-600 -translate-x-1" : "text-[#D1C9BC]"
                        }`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
