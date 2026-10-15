"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink, Sparkles, CheckCircle2, AlertCircle, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getInteractiveTopic } from "@/lib/interactiveTopicsData";
import RenderPipelineSim from "./interactive/RenderPipelineSim";
import EffectTimelineScrubber from "./interactive/EffectTimelineScrubber";

function RichTextRenderer({ content }) {
  if (!content) return <p className="text-[#6B7280]">محتوایی یافت نشد.</p>;

  if (typeof content === "string") {
    return <div className="prose max-w-none text-xs leading-relaxed text-[#3E4452]" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (!content.root || !content.root.children) {
    return <p className="text-[#6B7280]">محتوایی ثبت نشده است.</p>;
  }

  function renderNode(node, index) {
    if (node.type === "text") {
      let text = node.text;
      if (node.format & 1) text = <strong key={index} className="text-[#181A20] font-bold">{text}</strong>;
      if (node.format & 2) text = <em key={index} className="italic text-[#4A5260]">{text}</em>;
      if (node.format & 8) text = <u key={index}>{text}</u>;
      if (node.format & 16) text = <code key={index} className="bg-[#FAF8F5] text-sky-800 border border-[#E6E0D5] px-1.5 py-0.5 rounded text-[11px] font-mono">{text}</code>;
      return text;
    }

    if (node.type === "linebreak") {
      return <br key={index} />;
    }

    if (node.type === "horizontalrule") {
      return <hr key={index} className="my-3 border-[#E6E0D5]" />;
    }

    if (node.type === "paragraph") {
      return (
        <p key={index} dir="auto" className="mb-3 leading-relaxed text-[#3E4452] text-xs sm:text-[13px]">
          {node.children?.map((child, i) => renderNode(child, i))}
        </p>
      );
    }

    if (node.type === "heading") {
      const Tag = node.tag || "h3";
      return (
        <Tag key={index} dir="auto" className="font-bold text-[#181A20] mb-2 mt-4 text-sm sm:text-base">
          {node.children?.map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    if (node.type === "list") {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return (
        <Tag key={index} dir="auto" className="list-disc list-inside mb-3 pr-2 space-y-1 text-xs text-[#3E4452]">
          {node.children?.map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    if (node.type === "listitem") {
      return (
        <li key={index}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </li>
      );
    }

    if (node.type === "code") {
      const getCodeText = (n) => {
        if (!n) return "";
        if (typeof n === "string") return n;
        if (n.text) return n.text;
        if (n.type === "linebreak") return "\n";
        if (n.children && Array.isArray(n.children)) return n.children.map(getCodeText).join("");
        return "";
      };
      const code = getCodeText(node);
      const language = node.language || "javascript";
      return (
        <div key={index} className="my-2.5 rounded-xl border border-[#232733] overflow-hidden text-left" dir="ltr">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "0.85rem",
              background: "#14161D",
              fontSize: "0.8rem",
              lineHeight: "1.55",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    if (node.type === "quote") {
      return (
        <blockquote key={index} className="border-r-2 border-sky-400 pr-3 italic my-3 text-xs text-[#6B7280]">
          {node.children?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );
    }

    if (node.children) {
      return (
        <span key={index}>
          {node.children.map((child, i) => renderNode(child, i))}
        </span>
      );
    }

    return null;
  }

  return (
    <div className="space-y-1">
      {content.root.children.map((node, index) => renderNode(node, index))}
    </div>
  );
}

export default function TopicDetailSheet({
  topic,
  isOpen,
  onClose,
  isMastered,
  onToggleMastered,
}) {
  const [lang, setLang] = useState("ts");
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!topic) return null;

  // Retrieve rich interactive data if available
  const interactive = getInteractiveTopic(topic.slug || topic.title);
  const isLighthouse = Boolean(interactive);
  const canonicalSlug = interactive?.slug || topic.slug || topic.id;
  const topicHref = `/topic/${encodeURIComponent(canonicalSlug)}`;

  const activeSnippet =
    interactive?.quickRef
      ? lang === "ts"
        ? interactive.quickRef.tsSnippet
        : interactive.quickRef.jsSnippet
      : null;

  const handleCopy = async () => {
    if (!activeSnippet) return;
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const isUseEffect = topic.slug?.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";
  const isStateTopic = topic.title?.toLowerCase().includes("state") || topic.slug?.toLowerCase().includes("state");

  const getTierLabel = (tier) => {
    switch (tier) {
      case "🟢":
        return { text: "مفهوم ریشه (مقدماتی)", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "🔵":
        return { text: "مفهوم ساقه (کاربردی)", badge: "bg-sky-50 text-sky-800 border-sky-200" };
      case "🟣":
        return { text: "مفهوم سایبان (پیشرفته)", badge: "bg-purple-50 text-purple-800 border-purple-200" };
      default:
        return { text: "مفهوم ری‌اکت", badge: "bg-[#F3EFE9] text-[#4A5260] border-[#E6E0D5]" };
    }
  };

  const tierInfo = getTierLabel(topic.tier);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-[2px]"
          />

          {/* Clean Editorial Slide-Over Reader */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xl bg-[#FFFFFF] border-r border-[#E6E0D5] shadow-2xl flex flex-col text-right overflow-hidden font-sans"
            dir="rtl"
          >
            {/* Minimal Header */}
            <div className="shrink-0 px-6 py-4 border-b border-[#F0EBE1] bg-[#FAF8F5]/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#181A20] hover:bg-white border border-transparent hover:border-[#E6E0D5] transition-colors cursor-pointer"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono border ${tierInfo.badge}`}>
                    {tierInfo.text}
                  </span>
                  {topic.categoryName && (
                    <span className="text-xs text-[#6B7280] font-sans">
                      در {topic.categoryName}
                    </span>
                  )}
                </div>
              </div>

              {/* Mastery Action Button */}
              <button
                type="button"
                onClick={() => onToggleMastered(topic.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  isMastered
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                    : "bg-white border-[#E6E0D5] text-[#4A5260] hover:text-[#181A20] hover:bg-[#FAF8F5]"
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? "text-emerald-600" : ""}`} />
                <span>{isMastered ? "مسلط شدید ✓" : "علامت تسلط"}</span>
              </button>
            </div>

            {/* Scrollable Reader Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 custom-scrollbar">
              {/* Title Section */}
              <div className="space-y-2 border-b border-[#F0EBE1] pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-[#181A20] tracking-tight" dir="auto">
                    {topic.title}
                  </h2>
                  {isLighthouse && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      Enhanced ⚡
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#4A5260] leading-relaxed">
                  {interactive?.mentalModel ||
                    "خلاصه مفهومی و راهنمای پیاده‌سازی تمیز در اکوسیستم مدرن ری‌اکت."}
                </p>
              </div>

              {/* Code Snippet Card */}
              {activeSnippet ? (
                <div className="rounded-xl border border-[#232733] bg-[#14161D] overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#232733] bg-[#1B1E28] text-xs font-mono">
                    <span className="text-[#9CA3AF] text-[11px]">اسنیپت استاندارد:</span>

                    <div className="flex items-center gap-2">
                      <div className="flex rounded-md bg-[#12141A] p-0.5 border border-[#2B303F] text-[10px]">
                        <button
                          type="button"
                          onClick={() => setLang("ts")}
                          className={`px-2 py-0.5 rounded ${lang === "ts" ? "bg-[#252A38] text-white font-bold" : "text-[#9CA3AF]"}`}
                        >
                          TS
                        </button>
                        <button
                          type="button"
                          onClick={() => setLang("js")}
                          className={`px-2 py-0.5 rounded ${lang === "js" ? "bg-[#252A38] text-white font-bold" : "text-[#9CA3AF]"}`}
                        >
                          JS
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[#252A38] hover:bg-[#303748] text-white transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
                        <span>{copied ? "کپی شد" : "کپی"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-left" dir="ltr">
                    <SyntaxHighlighter
                      language={lang === "ts" ? "typescript" : "javascript"}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "#14161D",
                        fontSize: "0.82rem",
                        lineHeight: "1.6",
                      }}
                    >
                      {activeSnippet}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ) : topic.description ? (
                <div className="p-4 rounded-xl border border-[#E6E0D5] bg-[#FAF8F5] text-xs text-[#3E4452] leading-relaxed">
                  <RichTextRenderer content={topic.description} />
                </div>
              ) : null}

              {/* Golden Rule / Trap Note */}
              {interactive?.rule && (
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950 font-bold ml-1">تله یا نکته کلیدی پروداکشن:</strong>
                    <span>{interactive.rule}</span>
                  </div>
                </div>
              )}

              {/* Embedded Live Visual Model if topic matches */}
              {isUseEffect && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono font-bold text-[#181A20] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>تایم‌لاین تعاملی چرخه حیات و کلین‌آپ:</span>
                  </div>
                  <EffectTimelineScrubber />
                </div>
              )}

              {isStateTopic && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono font-bold text-[#181A20] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>شبیه‌ساز زنده رندرهای ری‌اکت:</span>
                  </div>
                  <RenderPipelineSim />
                </div>
              )}

              {/* Link to Full Interactive Deep Dive Page */}
              <div className="p-4 rounded-xl border border-[#E6E0D5] bg-[#FAF8F5] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#181A20]">صفحه کامل مهندسی</div>
                  <div className="text-[11px] text-[#6B7280]">شامل درخت تصمیم‌گیری، مقایسه باگ AI و چالش ۳۰ ثانیه‌ای</div>
                </div>

                <Link
                  href={topicHref}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#181A20] hover:bg-[#2D333F] text-white text-xs font-medium transition-all"
                >
                  <span>ورود به تحلیل کامل</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
