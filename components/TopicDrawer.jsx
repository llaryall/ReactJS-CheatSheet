"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Sparkles, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import QuickRefBlock from "./interactive/QuickRefBlock";

export default function TopicDrawer({ topic, isOpen, onClose }) {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!topic) return null;

  const isLighthouse = topic.slug?.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
  const topicHref = isLighthouse ? "/topic/use-effect" : `/topic/${topic.slug || topic.id}`;

  const getTierColor = (tier) => {
    switch (tier) {
      case "🟢":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "🔵":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "🟣":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-neutral-400 bg-neutral-500/10 border-neutral-500/20";
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case "🟢":
        return "مقدماتی (Beginner)";
      case "🔵":
        return "رایج و کاربردی (Common)";
      case "🟣":
        return "پیشرفته مهندسی (Advanced)";
      default:
        return tier;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-right"
            dir="rtl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${getTierColor(topic.tier)}`}>
                    {topic.tier} {getTierName(topic.tier)}
                  </span>
                  {topic.categoryName && (
                    <span className="text-xs text-neutral-500 font-sans">
                      در {topic.categoryName}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Full Page Link */}
              <Link
                href={topicHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-mono border border-neutral-700/60 transition-all hover:border-purple-500/40"
              >
                <span>صفحه کامل و تعاملی</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
              {/* Title and Badge */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-neutral-100 font-sans">
                    {topic.title}
                  </h2>
                  {isLighthouse && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Lighthouse Edition ⚡
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-400 font-sans leading-relaxed">
                  مرجع مهندسی، مدل‌های ذهنی و نحوه تصمیم‌گیری درست در سناریوهای پروداکشن.
                </p>
              </div>

              {/* Layer 1: Quick Reference */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>لایه‌ی اول: پاسخ سریع و سینتکس (Quick Reference)</span>
                </div>

                {isLighthouse ? (
                  <QuickRefBlock
                    title="useEffect Quick Reference"
                    mentalModel="افکت برای سینک کردن وضعیت کامپوننت با سیستم‌های خارج از ری‌اکت است (مثل API، Browser DOM، WebSocket). اگر سیستم خارجی در کار نیست، نیازی به افکت ندارید."
                    rule="محاسبات رندری (Derived State) و هندلرهای رویداد کاربر را هرگز در useEffect قرار ندهید."
                    tsSnippet={`import { useEffect } from 'react';

useEffect(() => {
  // 1. Setup logic (ارتباط با سیستم خارجی)
  const controller = new AbortController();
  fetchData(id, { signal: controller.signal });

  // 2. Cleanup function (اجرا قبل از ران بعدی یا هنگام آن‌مانت)
  return () => {
    controller.abort();
  };
}, [id]); // 3. Reactive dependencies`}
                    jsSnippet={`import { useEffect } from 'react';

useEffect(() => {
  const controller = new AbortController();
  fetchData(id, { signal: controller.signal });

  return () => {
    controller.abort();
  };
}, [id]);`}
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 text-sm leading-relaxed">
                    {typeof topic.description === "string" ? (
                      <div dangerouslySetInnerHTML={{ __html: topic.description }} />
                    ) : (
                      <p>محتوای استاندارد از پایگاه داده لود شد.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Callout to Dedicated Deep-Dive */}
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-neutral-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>لایه‌ی دوم: بررسی عمیق معماری و درخت تصمیم</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  شامل درخت تصمیم‌گیری تعاملی، مقایسه کدهای دارای باگ هوش مصنوعی با کدهای پروداکشن مهندسی، تغییرات React 19 و چالش ۳۰ ثانیه‌ای Spot-the-Bug.
                </p>
                <div className="pt-1">
                  <Link
                    href={topicHref}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>ورود به تحلیل کامل مهندسی و ابزارهای تعاملی</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
