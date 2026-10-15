"use client";

import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Cpu,
  Layers,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Code2,
} from "lucide-react";
import QuickRefBlock from "./interactive/QuickRefBlock";
import DecisionTree from "./interactive/DecisionTree";
import CodeComparison from "./interactive/CodeComparison";
import MicroQuiz from "./interactive/MicroQuiz";
import { getInteractiveTopic } from "@/lib/interactiveTopicsData";

export default function LiveWorkbench({
  topic,
  isMastered,
  onToggleMastered,
}) {
  if (!topic) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-neutral-500 font-sans" dir="rtl">
        <div className="max-w-md space-y-3">
          <Code2 className="w-10 h-10 mx-auto text-neutral-700" />
          <h4 className="text-base font-bold text-neutral-300">یک ایستگاه را از خطوط مهارت انتخاب کنید</h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            از پنل سمت راست، هر کدام از مباحث را انتخاب کنید تا بلافاصله پاسخ سریع، سینتکس، تله‌های هوش مصنوعی و مدل‌های ذهنی در این میزکار به نمایش درآید.
          </p>
        </div>
      </div>
    );
  }

  // Look up rich interactive dataset for this topic (if available)
  const interactiveContent = getInteractiveTopic(topic.slug || topic.title);
  const isLighthouse = Boolean(interactiveContent);
  const canonicalSlug = interactiveContent?.slug || topic.slug || topic.id;
  const topicHref = `/topic/${encodeURIComponent(canonicalSlug)}`;

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

  return (
    <div className="h-full flex flex-col bg-[#080B11] text-right overflow-hidden" dir="rtl">
      {/* Workbench Action Topbar */}
      <div className="shrink-0 px-6 py-3.5 border-b border-neutral-850/80 bg-[#090D15]/80 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border shrink-0 ${getTierColor(
              topic.tier
            )}`}
          >
            {topic.tier} {topic.tier === "🟢" ? "مقدماتی (ریشه)" : topic.tier === "🔵" ? "کاربردی (ساقه)" : "پیشرفته (سایبان)"}
          </span>

          {topic.categoryName && (
            <span className="text-xs text-neutral-500 truncate font-sans">
              در {topic.categoryName}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleMastered(topic.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isMastered
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${isMastered ? "text-emerald-400" : ""}`}
            />
            <span>{isMastered ? "مسلط شدید ✓" : "علامت تسلط"}</span>
          </button>

          <Link
            href={topicHref}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-mono transition-all"
          >
            <span>صفحه اختصاصی</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Scrollable Workbench Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
        {/* Title Header */}
        <div className="space-y-2 border-b border-neutral-850 pb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
              {topic.title}
            </h2>
            {isLighthouse && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Enhanced Edition ⚡
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
            {interactiveContent?.mentalModel ||
              "مرجع سریع سینتکس، الگوهای مقاوم و تصمیم‌گیری معماری."}
          </p>
        </div>

        {/* Layer 1: Quick Reference Block */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>لایه‌ی اول: پاسخ سریع زیر ۳ ثانیه (Quick Reference)</span>
          </div>

          {interactiveContent ? (
            <QuickRefBlock
              title={`${topic.title} Quick Reference`}
              mentalModel={interactiveContent.mentalModel}
              rule={interactiveContent.rule}
              reactVersion={interactiveContent.reactVersion || "React 18 & 19"}
              tsSnippet={interactiveContent.quickRef.tsSnippet}
              jsSnippet={interactiveContent.quickRef.jsSnippet}
            />
          ) : (
            <div className="rounded-2xl border border-neutral-850 bg-neutral-900/40 p-5 space-y-4">
              <div className="text-sm leading-relaxed text-neutral-300 font-sans">
                {typeof topic.description === "string" ? (
                  <div dangerouslySetInnerHTML={{ __html: topic.description }} />
                ) : (
                  <p>اسنیپت و مستندات استاندارد از پایگاه داده بارگذاری شد.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Layer 2: Interactive Modules (when interactiveContent exists) */}
        {interactiveContent && (
          <>
            {/* Decision Tree */}
            {interactiveContent.decisionTree && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>لایه‌ی دوم: درخت تصمیم‌گیری تعاملی معماری</span>
                </div>

                <DecisionTree
                  title={interactiveContent.decisionTree.title}
                  subtitle={interactiveContent.decisionTree.subtitle}
                  treeData={interactiveContent.decisionTree.treeData}
                />
              </div>
            )}

            {/* Code Comparison (AI vs Senior) */}
            {interactiveContent.codeComparison && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>مقایسه فنی: تله هوش مصنوعی در برابر استاندارد پروداکشن</span>
                </div>

                <CodeComparison
                  title={interactiveContent.codeComparison.title}
                  description={interactiveContent.codeComparison.description}
                  badTitle={interactiveContent.codeComparison.badTitle}
                  badGotcha={interactiveContent.codeComparison.badGotcha}
                  badCode={interactiveContent.codeComparison.badCode}
                  goodTitle={interactiveContent.codeComparison.goodTitle}
                  goodReason={interactiveContent.codeComparison.goodReason}
                  goodCode={interactiveContent.codeComparison.goodCode}
                />
              </div>
            )}

            {/* React 19 Shift */}
            {interactiveContent.react19Notes && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>تحول در ری‌اکت ۱۹ (React 19 Shift)</span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white font-sans">
                  {interactiveContent.react19Notes.summary}
                </h4>

                <div className="grid sm:grid-cols-2 gap-3 text-xs text-neutral-300 leading-relaxed pt-1">
                  {interactiveContent.react19Notes.points?.map((pt, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-neutral-850 bg-neutral-950/70 space-y-1">
                      <div className="font-bold text-neutral-100">
                        {i + 1}. {pt.title}
                      </div>
                      <p className="text-neutral-400 leading-relaxed">{pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 30s Bug Challenge */}
            {interactiveContent.quiz && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>لایه‌ی سوم: چالش ۳۰ ثانیه‌ای مهندسی (Spot the Bug)</span>
                </div>

                <MicroQuiz
                  title={interactiveContent.quiz.title}
                  question={interactiveContent.quiz.question}
                  codeSnippet={interactiveContent.quiz.codeSnippet}
                  options={interactiveContent.quiz.options}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
