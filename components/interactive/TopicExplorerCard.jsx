"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Play,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import IsometricWindowVisualizer from "./IsometricWindowVisualizer";
import EffectTimelineScrubber from "./EffectTimelineScrubber";
import RenderPipelineSim from "./RenderPipelineSim";
import { getInteractiveTopic } from "@/lib/interactiveTopicsData";

export default function TopicExplorerCard({
  activeTopic,
  onResetTopic,
  onOpenBrowse,
  currentLocale = "en",
}) {
  const [activeMode, setActiveMode] = useState("reference"); // 'reference' | 'simulator'
  const [lang, setLang] = useState("ts");
  const [copied, setCopied] = useState(false);

  const currentSlug = activeTopic?.slug || "useEffect";
  const interactive = getInteractiveTopic(currentSlug) || getInteractiveTopic("useEffect");

  const isDefaultOrEffect =
    !activeTopic || currentSlug.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
  const title = isDefaultOrEffect ? "useEffect" : activeTopic?.title || "useEffect";
  const subtitle = isDefaultOrEffect
    ? "Synchronize with external systems and handle side effects."
    : interactive?.mentalModel || "Synchronize with external systems and handle side effects.";

  const isUseEffect =
    currentSlug.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
  const isStateTopic =
    title.toLowerCase().includes("state") || currentSlug.toLowerCase().includes("state");

  const referenceCode = `useEffect(() => {
  // Your side effect
  return () => {
    // Cleanup (optional)
  };
}, [dependencies]);`;

  const snippet = isDefaultOrEffect
    ? referenceCode
    : interactive?.quickRef
    ? lang === "ts"
      ? interactive.quickRef.tsSnippet
      : interactive.quickRef.jsSnippet
    : referenceCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const topicHref = `/${currentLocale}/topic/${encodeURIComponent(currentSlug)}`;

  return (
    <div
      className="w-full h-full rounded-[2.5rem] bg-white/85 backdrop-blur-xl border border-white/90 p-6 sm:p-7 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.06)] text-left font-sans flex flex-col justify-between"
      dir="ltr"
    >
      <div>
        {/* Top Header Bar matching Reference: "← Back to all topics" and "● Intermediate" */}
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={onResetTopic || onOpenBrowse}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to all topics</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Intermediate</span>
          </div>
        </div>

        {/* Title, Subtitle, Tags & 3D Isometric Screen Graphic matching Reference */}
        <div className="flex items-start justify-between gap-4 pt-1 pb-3">
          <div className="space-y-1.5 max-w-sm sm:max-w-md">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans line-clamp-2">
              {subtitle}
            </p>

            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[11px]">
                Hooks
              </span>
              <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[11px]">
                Side Effects
              </span>
              <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[11px]">
                Lifecycle
              </span>
            </div>
          </div>

          {/* 3D Isometric Screen Illustration */}
          <div className="shrink-0 hidden sm:block">
            <IsometricWindowVisualizer />
          </div>
        </div>

        {/* Streamlined Mode Segmented Control: Quick Reference vs Interactive Simulator */}
        <div className="flex items-center justify-between gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 mb-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveMode("reference")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeMode === "reference"
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  activeMode === "reference" ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <span>Quick Reference</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("simulator")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeMode === "simulator"
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Activity
                className={`w-3.5 h-3.5 ${
                  activeMode === "simulator" ? "text-purple-600" : "text-slate-400"
                }`}
              />
              <span>Interactive Simulator</span>
            </button>
          </div>

          <Link
            href={topicHref}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded-lg hover:bg-blue-50/60 transition-colors"
          >
            <span>Full Guide</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeMode === "reference" ? (
          <div className="space-y-3">
            {/* The essentials */}
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                The essentials
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                useEffect lets you run side effects in function components, such
                as data fetching, subscriptions, or manually updating the DOM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Left Column: Code Window + Try it yourself banner */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-2">
                <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] overflow-hidden text-left relative flex-1 flex flex-col justify-between">
                  {/* Code Bar Header matching Reference */}
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-200 bg-white text-xs">
                    <span className="font-mono text-[11px] text-slate-500">
                      useEffect() =&gt;
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* TS / JS Toggle Pill */}
                      <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setLang("ts")}
                          className={`px-2 py-0.5 rounded-md ${
                            lang === "ts"
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          TS
                        </button>
                        <button
                          type="button"
                          onClick={() => setLang("js")}
                          className={`px-2 py-0.5 rounded-md ${
                            lang === "js"
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          JS
                        </button>
                      </div>

                      {/* Copy button */}
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Block with Syntax Highlighting */}
                  <div className="flex-1 bg-[#1A1F2C] text-left">
                    <SyntaxHighlighter
                      language={lang === "ts" ? "typescript" : "javascript"}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        padding: "0.85rem 1rem",
                        background: "#1A1F2C",
                        fontSize: "0.78rem",
                        lineHeight: "1.52",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {snippet}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {/* Try it yourself banner switching directly to simulator */}
                <button
                  type="button"
                  onClick={() => setActiveMode("simulator")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 hover:bg-blue-100/80 text-blue-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </div>
                    <span>
                      Try it yourself: See the behavior with interactive simulator
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Right Column: When to use? & When not to use? matching Reference */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-2.5">
                {/* When to use? card with green checks */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>When to use?</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">
                        Interacting with external systems
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">Fetching data</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">Subscribing to events</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">
                        Updating the DOM manually
                      </span>
                    </div>
                  </div>
                </div>

                {/* When not to use? card with amber warning */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>When not to use?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    For simple calculations or transformations (use render
                    instead).
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mode 2: Interactive Simulator */
          <div className="space-y-3">
            {isUseEffect ? (
              <EffectTimelineScrubber />
            ) : isStateTopic ? (
              <RenderPipelineSim />
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <h4 className="font-bold text-sm text-slate-900">
                  Concept Simulator Ready
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {interactive?.mentalModel ||
                    "Interactive mental model simulator is available on the dedicated topic page."}
                </p>
                <Link
                  href={topicHref}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors mt-2"
                >
                  <span>Open Full Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
