"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Play,
  Zap,
  Search,
  GitBranch,
  Code2,
  AlertTriangle,
  Link2,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import DecisionTree from "@/components/interactive/DecisionTree";
import CodeComparison from "@/components/interactive/CodeComparison";
import MicroQuiz from "@/components/interactive/MicroQuiz";
import EffectTimelineScrubber from "@/components/interactive/EffectTimelineScrubber";
import RenderPipelineSim from "@/components/interactive/RenderPipelineSim";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TopicDetailClient({ topic, interactive, currentLocale = "en" }) {
  const [activeTab, setActiveTab] = useState("quick"); // 'quick' | 'deep' | 'tree' | 'examples' | 'gotchas' | 'related'
  const [lang, setLang] = useState("ts");
  const [copied, setCopied] = useState(false);

  const title = topic?.title || "useEffect";
  const slug = topic?.slug || "useeffect";
  const isUseEffect = slug.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
  const isStateTopic = title.toLowerCase().includes("state") || slug.toLowerCase().includes("state");

  const isFa = currentLocale === "fa";

  const defaultSnippet = `useEffect(() => {
  // Your side effect
  return () => {
    // Cleanup (optional)
  };
}, [dependencies]);`;

  const snippet =
    interactive?.quickRef
      ? lang === "ts"
        ? interactive.quickRef.tsSnippet
        : interactive.quickRef.jsSnippet
      : defaultSnippet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { id: "quick", label: isFa ? "رفرنس سریع" : "Quick Reference", icon: Zap },
    { id: "deep", label: isFa ? "تحلیل عمیق" : "Deep Dive", icon: Search },
    { id: "tree", label: isFa ? "درخت تصمیم" : "Decision Tree", icon: GitBranch },
    { id: "examples", label: isFa ? "نمونه کد" : "Examples", icon: Code2 },
    { id: "gotchas", label: isFa ? "تله‌ها و باگ‌ها" : "Gotchas", icon: AlertTriangle },
    { id: "related", label: isFa ? "مباحث مرتبط" : "Related", icon: Link2 },
  ];

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6 font-sans text-left"
      dir={isFa ? "rtl" : "ltr"}
    >
      {/* Top Breadcrumb & Difficulty Indicator matching Reference */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${currentLocale}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isFa ? "rotate-180" : ""}`} />
          <span>{isFa ? "بازگشت به همه موضوعات" : "Back to all topics"}</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={currentLocale} />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{isFa ? "متوسط" : "Intermediate"}</span>
          </div>
        </div>
      </div>

      {/* Hero Header Area with 3D Visual Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft Background Tint */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="space-y-4 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            {interactive?.mentalModel || "Synchronize with external systems and handle side effects."}
          </p>

          {/* Category Pill Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              Hooks
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              Side Effects
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              Lifecycle
            </span>
          </div>
        </div>

        {/* 3D Isometric Screen Illustration matching Reference */}
        <div className="shrink-0 w-44 h-36 relative flex items-center justify-center select-none">
          <div className="relative w-36 h-28 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 p-0.5 shadow-xl shadow-sky-500/20 flex flex-col justify-between overflow-hidden">
            {/* Top Mac Bar */}
            <div className="h-5 bg-sky-600/40 px-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            </div>

            {/* Inner Content Icon */}
            <div className="flex-1 bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-white drop-shadow-md animate-[spin_10s_linear_infinite]" />
            </div>
          </div>

          {/* Floating Glass Block */}
          <div className="absolute -bottom-2 -left-2 w-12 h-10 rounded-xl bg-white/90 border border-white/80 shadow-md backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-sky-500" />
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation Bar matching Reference */}
      <div className="glass-panel rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === "quick" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): The essentials + Code Block */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">The essentials</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                useEffect lets you run side effects in function components, such as data fetching, subscriptions, or manually updating the DOM.
              </p>
            </div>

            {/* Code Snippet Box with TS/JS Toggle & Copy */}
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] overflow-hidden text-left relative">
              <div className="flex items-center justify-end gap-2 px-3.5 py-2 border-b border-slate-200 bg-white text-xs">
                {/* TS/JS Pill Toggle */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setLang("ts")}
                    className={`px-2 py-0.5 rounded-md ${lang === "ts" ? "bg-sky-600 text-white font-bold" : "text-slate-600"}`}
                  >
                    TS
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("js")}
                    className={`px-2 py-0.5 rounded-md ${lang === "js" ? "bg-sky-600 text-white font-bold" : "text-slate-600"}`}
                  >
                    JS
                  </button>
                </div>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Code */}
              <SyntaxHighlighter
                language={lang === "ts" ? "typescript" : "javascript"}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: "1rem 1.25rem",
                  background: "#1E2230",
                  fontSize: "0.82rem",
                  lineHeight: "1.65",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {snippet}
              </SyntaxHighlighter>
            </div>

            {/* Try it yourself action link */}
            <button
              type="button"
              onClick={() => setActiveTab("deep")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 hover:bg-blue-100/70 text-blue-900 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>Try it yourself: See the behavior with interactive example</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform rotate-180" />
            </button>
          </div>

          {/* Right Column (5 cols): When to use & When not to use Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* When to use? */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>When to use?</span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Interacting with external systems</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Fetching data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Subscribing to events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Updating the DOM manually</span>
                </div>
              </div>
            </div>

            {/* When not to use? */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>When not to use?</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                For simple calculations or transformations (use render instead).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dive Tab */}
      {activeTab === "deep" && (
        <div className="space-y-6">
          {isUseEffect && <EffectTimelineScrubber />}
          {isStateTopic && <RenderPipelineSim />}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Mental Model Breakdown</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {interactive?.mentalModel || "An in-depth conceptual breakdown of how React coordinates this primitive under the hood."}
            </p>
          </div>
        </div>
      )}

      {/* Decision Tree Tab */}
      {activeTab === "tree" && (
        <div className="space-y-6">
          <DecisionTree />
        </div>
      )}

      {/* Examples / Code Comparison Tab */}
      {activeTab === "examples" && (
        <div className="space-y-6">
          <CodeComparison />
        </div>
      )}

      {/* Gotchas / Quiz Tab */}
      {activeTab === "gotchas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MicroQuiz />
          <CodeComparison />
        </div>
      )}

      {/* Related Tab */}
      {activeTab === "related" && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Related Concepts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/topic/usestate" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="font-bold text-sm text-slate-900">useState</div>
              <div className="text-xs text-slate-500 mt-1">State & Snapshot updates</div>
            </Link>
            <Link href="/topic/usecallback,%20usememo" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="font-bold text-sm text-slate-900">useCallback</div>
              <div className="text-xs text-slate-500 mt-1">Stable function references</div>
            </Link>
            <Link href="/topic/useref" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="font-bold text-sm text-slate-900">useRef</div>
              <div className="text-xs text-slate-500 mt-1">Persistent values without re-render</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
