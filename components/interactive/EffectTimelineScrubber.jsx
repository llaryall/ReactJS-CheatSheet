"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronRight, ChevronLeft, RotateCcw, AlertTriangle, Eye, ShieldCheck, Clock } from "lucide-react";

const TIMELINE_STEPS = [
  {
    id: 1,
    title: "۱. رندر اولیه (Mount Render)",
    phase: "Render Phase",
    domState: "هنوز در مرورگر کشیده نشده",
    screenContent: "در حال محاسبه JSX در حافظه...",
    activeAction: "React بدنه تابع کامپوننت را با id=1 اجرا می‌کند.",
    closureSnapshot: "{ id: 1 }",
    explanation: "ری‌اکت ساختار JSX را به درخت Virtual DOM تبدیل می‌کند. در این لحظه تابع افکت هنوز اجرا نشده است.",
  },
  {
    id: 2,
    title: "۲. ارسال به DOM و نقاشی مرورگر (Browser Paint)",
    phase: "Commit Phase",
    domState: "المنت‌های واقعی در صفحه درج شدند",
    screenContent: "کاربر پروفایل کاربر شماره ۱ را می‌بیند.",
    activeAction: "DOM آپدیت شد و کاربر تصویر کامپوننت را روی مانیتور مشاهده کرد.",
    closureSnapshot: "{ id: 1 }",
    explanation: "ری‌اکت ابتدا نقاشی مرورگر را انجام می‌دهد تا کاربر معطل افکت‌های ناهمگام نماند.",
  },
  {
    id: 3,
    title: "۳. اجرای تابع Setup افکت اول",
    phase: "Effect Execution",
    domState: "پایدار روی صفحه",
    screenContent: "داده‌های کاربر شماره ۱ از سرور دریافت و نمایش داده شد.",
    activeAction: "Setup 1: اشتراک یا رکوئست با { id: 1 } شروع شد.",
    closureSnapshot: "Setup Function 1 بسته‌شده با { id: 1 }",
    explanation: "پس از پایان نقاشی صفحه، تابع اصلی افکت اجرا می‌شود و به لیسنر یا شبکه وصل می‌گردد.",
  },
  {
    id: 4,
    title: "۴. تغییر استیت یا پراپ (id از ۱ به ۲ تغییر کرد)",
    phase: "Re-render Triggered",
    domState: "رندر جدید آغاز شد",
    screenContent: "کامپوننت برای id=2 دوباره اجرا شد و JSX جدید تولید گشت.",
    activeAction: "React بدنه تابع را مجدداً با id=2 اجرا و نقاشی می‌کند.",
    closureSnapshot: "{ id: 2 }",
    explanation: "پراپ جدید رسید. کاربر خروجی جدید را می‌بیند اما افکت قبلی هنوز فعال است!",
  },
  {
    id: 5,
    title: "۵. ⚡ اجرای Cleanup افکت قبلی (قبل از افکت جدید!)",
    phase: "⚡ Cleanup Execution",
    domState: "صفحه با id=2 نشان داده شده",
    screenContent: "پاکسازی منابع افکت قدیمی شماره ۱ انجام شد.",
    activeAction: "Cleanup 1 صدا زده می‌شود با اسنپ‌شات قدیمی { id: 1 }!",
    closureSnapshot: "Cleanup 1 بسته‌شده با { id: 1 }",
    highlight: true,
    explanation: "مهم‌ترین راز ری‌اکت: کلین‌آپ فقط موقع خروج از صفحه صدا زده نمی‌شود! ری‌اکت ابتدا کلین‌آپ رندر گذشته را اجرا می‌کند تا منبع کهنه بسته شود، سپس افکت رندر جدید را استارت می‌زند.",
  },
  {
    id: 6,
    title: "۶. اجرای تابع Setup افکت دوم (با داده جدید)",
    phase: "New Effect Setup",
    domState: "کاملاً همگام با id=2",
    screenContent: "اطلاعات کاربر شماره ۲ از سرور لود شد.",
    activeAction: "Setup 2 با { id: 2 } راه‌اندازی شد.",
    closureSnapshot: "Setup Function 2 بسته‌شده با { id: 2 }",
    explanation: "اکنون اتصال جدید بدون تداخل با اتصال گذشته برقرار است.",
  },
];

export default function EffectTimelineScrubber() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const step = TIMELINE_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TIMELINE_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="rounded-2xl border border-[#E6E0D5] bg-[#FFFFFF] shadow-sm overflow-hidden text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F0EBE1] bg-[#FAF8F5]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-700 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#181A20]">تایم‌لاین تعاملی: کلین‌آپ در useEffect دقیقاً کی اجرا می‌شود؟</h4>
            <p className="text-xs text-[#6B7280]">گام‌ها را جلو ببرید تا ترتیب اجرای Setup و Cleanup را در حافظه ببینید</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#6B7280] hover:text-[#181A20] rounded-lg border border-[#E6E0D5] bg-white hover:bg-[#FAF8F5] transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>شروع مجدد</span>
        </button>
      </div>

      {/* Step Scrubber Navigation Bar */}
      <div className="p-4 bg-[#FDFCFA] border-b border-[#F0EBE1] flex flex-wrap items-center justify-between gap-3">
        {/* Step Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {TIMELINE_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  isCurrent
                    ? s.highlight
                      ? "bg-purple-100 border-purple-400 text-purple-900 font-bold shadow-sm"
                      : "bg-[#181A20] border-[#181A20] text-white font-bold shadow-sm"
                    : isPast
                    ? "bg-[#FAF8F5] border-[#E6E0D5] text-emerald-800"
                    : "bg-white border-[#E6E0D5] text-[#8C93A0] hover:text-[#181A20]"
                }`}
              >
                گام {s.id}
              </button>
            );
          })}
        </div>

        {/* Next / Prev Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg border border-[#E6E0D5] bg-white hover:bg-[#FAF8F5] disabled:opacity-30 text-[#4A5260] transition-colors"
            title="گام قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStepIndex === TIMELINE_STEPS.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#2D333F] disabled:opacity-30 text-white text-xs font-medium transition-colors"
          >
            <span>گام بعد</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Active Step Canvas */}
      <div className="p-6 bg-[#FAF8F5] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              {step.phase}
            </span>
            <h5 className="text-base font-bold text-[#181A20]">{step.title}</h5>
          </div>

          <span className="text-xs font-mono text-[#8C93A0]">
            گام {step.id} از {TIMELINE_STEPS.length}
          </span>
        </div>

        {/* Visual Inspection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: What the user sees on screen */}
          <div className="p-4 rounded-xl border border-[#E6E0D5] bg-white space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-mono">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>روی مانیتور کاربر:</span>
            </div>
            <div className="text-xs font-medium text-[#181A20] leading-relaxed">
              {step.screenContent}
            </div>
          </div>

          {/* Card 2: Current active runtime action */}
          <div className="p-4 rounded-xl border border-[#E6E0D5] bg-white space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-mono">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>عملیات جاری ری‌اکت:</span>
            </div>
            <div className="text-xs font-medium text-[#181A20] leading-relaxed">
              {step.activeAction}
            </div>
          </div>

          {/* Card 3: Memory Closure State */}
          <div className="p-4 rounded-xl border border-[#E6E0D5] bg-white space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>اسنپ‌شات حافظه کلوسر:</span>
            </div>
            <div className="text-xs font-mono font-bold text-[#181A20] leading-relaxed">
              {step.closureSnapshot}
            </div>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
          step.highlight
            ? "bg-purple-50 border-purple-200 text-purple-950 font-medium"
            : "bg-white border-[#E6E0D5] text-[#3E4452]"
        }`}>
          {step.explanation}
        </div>
      </div>
    </div>
  );
}
