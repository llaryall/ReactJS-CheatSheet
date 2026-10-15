"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function QuickRefBlock({
  title = "Quick Reference",
  mentalModel,
  rule,
  tsSnippet,
  jsSnippet,
  reactVersion = "React 18 & 19",
}) {
  const [lang, setLang] = useState("ts");
  const [copied, setCopied] = useState(false);

  const activeSnippet = lang === "ts" ? tsSnippet || jsSnippet : jsSnippet || tsSnippet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E6E0D5] bg-[#FFFFFF] shadow-sm overflow-hidden text-right font-sans" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F0EBE1] bg-[#FAF8F5]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-700 text-xs font-mono font-bold">
            ⚡
          </span>
          <span className="font-mono text-xs font-bold text-[#181A20] uppercase tracking-wider">
            {title}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-800 border border-sky-200 font-mono">
            <Sparkles className="w-3 h-3 text-sky-600" />
            {reactVersion}
          </span>
        </div>

        {/* Language selector & Copy button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-white border border-[#E6E0D5] p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLang("ts")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === "ts"
                  ? "bg-[#181A20] text-white font-semibold shadow-xs"
                  : "text-[#6B7280] hover:text-[#181A20]"
              }`}
            >
              TypeScript
            </button>
            <button
              type="button"
              onClick={() => setLang("js")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === "js"
                  ? "bg-[#181A20] text-white font-semibold shadow-xs"
                  : "text-[#6B7280] hover:text-[#181A20]"
              }`}
            >
              JavaScript
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[#E6E0D5] bg-white hover:bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#181A20] transition-all active:scale-95 shadow-2xs"
            aria-label="Copy snippet"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-mono">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#6B7280]" />
                <span className="font-mono">کپی کد</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mental Model & Golden Rule Summary */}
      <div className="px-5 py-4 border-b border-[#F0EBE1] bg-[#FAF8F5] space-y-2.5 text-right">
        {mentalModel && (
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3E4452] leading-relaxed">
            <span className="shrink-0 text-emerald-800 font-bold font-mono text-[11px] mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
              مدل ذهنی
            </span>
            <p className="flex-1">{mentalModel}</p>
          </div>
        )}
        {rule && (
          <div className="flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed bg-amber-50/80 border border-amber-200/80 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="flex-1">
              <strong className="text-amber-950 font-bold ml-1">قانون طلایی پروداکشن:</strong>
              {rule}
            </p>
          </div>
        )}
      </div>

      {/* Code Display */}
      <div className="relative text-left" dir="ltr">
        <SyntaxHighlighter
          language={lang === "ts" ? "typescript" : "javascript"}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1.25rem 1.5rem",
            background: "#14171F",
            fontSize: "0.85rem",
            lineHeight: "1.65",
            fontFamily: "var(--font-mono, 'Geist Mono', 'Fira Code', monospace)",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono, 'Geist Mono', 'Fira Code', monospace)" },
          }}
        >
          {activeSnippet}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
