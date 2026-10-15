"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Sparkles, AlertCircle, CheckCircle2, Cpu, Eye, ArrowDown } from "lucide-react";

export default function RenderPipelineSim() {
  const [parentCount, setParentCount] = useState(0);
  const [feedCount, setFeedCount] = useState(0);
  const [memoizeSidebar, setMemoizeSidebar] = useState(true);
  const [lastAction, setLastAction] = useState("آماده برای شبیه‌سازی");
  const [animKey, setAnimKey] = useState(0);

  // Tracks which nodes rendered in the last action
  const [renderState, setRenderState] = useState({
    app: false,
    header: false,
    feed: false,
    sidebar: false,
  });

  const triggerParentUpdate = () => {
    setParentCount((c) => c + 1);
    setAnimKey((k) => k + 1);
    setLastAction("استیت در والد (<App />) تغییر کرد. به دلیل تغییر استیت والد، تمام درخت ریرندر می‌شود مگر کامپوننت‌هایی که با memo ایزوله شده‌اند.");
    setRenderState({
      app: true,
      header: true,
      feed: true,
      sidebar: !memoizeSidebar, // if memoized, skips!
    });
  };

  const triggerFeedUpdate = () => {
    setFeedCount((c) => c + 1);
    setAnimKey((k) => k + 1);
    setLastAction("استیت محلی در <FeedList /> تغییر کرد (State Colocation). فقط همین کامپوننت ریرندر می‌شود و والد یا کامپوننت‌های برادر بی‌دلیل درگیر نمی‌شوند.");
    setRenderState({
      app: false,
      header: false,
      feed: true,
      sidebar: false,
    });
  };

  const resetAll = () => {
    setParentCount(0);
    setFeedCount(0);
    setAnimKey((k) => k + 1);
    setLastAction("شبیه‌ساز به حالت اولیه بازنشانی شد.");
    setRenderState({ app: false, header: false, feed: false, sidebar: false });
  };

  return (
    <div className="rounded-2xl border border-[#E6E0D5] bg-[#FFFFFF] shadow-sm overflow-hidden text-right font-sans" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F0EBE1] bg-[#FAF8F5]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-700 text-xs font-mono font-bold">
            ⚛
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#181A20]">شبیه‌ساز زنده: آبشار رندرهای ری‌اکت (Re-render Cascade)</h4>
            <p className="text-xs text-[#6B7280]">ببینید چطور تغییر استیت درخت کامپوننت را تحت تأثیر قرار می‌دهد</p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#6B7280] hover:text-[#181A20] rounded-lg border border-[#E6E0D5] bg-white hover:bg-[#FAF8F5] transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>ریست</span>
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-4 bg-[#FDFCFA] border-b border-[#F0EBE1] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerParentUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181A20] hover:bg-[#2D333F] text-white font-medium shadow-sm transition-all active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>تغییر استیت در والد (&lt;App /&gt;)</span>
          </button>

          <button
            type="button"
            onClick={triggerFeedUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-medium transition-all active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>تغییر استیت محلی (&lt;FeedList /&gt;)</span>
          </button>
        </div>

        {/* Memo Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-[#4A5260] select-none">
          <input
            type="checkbox"
            checked={memoizeSidebar}
            onChange={(e) => setMemoizeSidebar(e.target.checked)}
            className="rounded border-[#D1C9BC] text-sky-600 focus:ring-sky-500 w-4 h-4"
          />
          <span className="font-mono text-xs">React.memo(&lt;Sidebar /&gt;)</span>
        </label>
      </div>

      {/* Visual Component Tree Canvas */}
      <div className="p-6 bg-[#FAF8F5] relative flex flex-col items-center justify-center min-h-[260px] space-y-6">
        {/* Parent Node: <App /> */}
        <motion.div
          key={`app-${animKey}`}
          animate={renderState.app ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`relative px-6 py-3 rounded-xl border transition-all text-center ${
            renderState.app
              ? "bg-amber-50 border-amber-400 text-amber-900 shadow-md ring-2 ring-amber-200"
              : "bg-white border-[#E6E0D5] text-[#181A20] shadow-sm"
          }`}
        >
          <div className="font-mono text-xs font-bold flex items-center justify-center gap-1.5">
            <span>&lt;App /&gt;</span>
            {renderState.app && <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded">Re-rendered</span>}
          </div>
          <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">
            Parent State: {parentCount}
          </div>

          {/* Stem connector down */}
          <div className="w-0.5 h-6 bg-[#DCD5C9] mx-auto absolute -bottom-6 left-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Children Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2">
          {/* Child 1: <Header /> */}
          <motion.div
            key={`header-${animKey}`}
            animate={renderState.header ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 0.3, delay: 0.05 }}
            className={`px-4 py-2.5 rounded-xl border text-center transition-all min-w-[120px] ${
              renderState.header
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-sm"
                : "bg-white border-[#E6E0D5] text-[#4A5260] shadow-sm opacity-90"
            }`}
          >
            <div className="font-mono text-xs font-semibold">&lt;Header /&gt;</div>
            <div className="text-[10px] text-[#8C93A0] font-mono mt-0.5">
              {renderState.header ? "ری‌رندر شد (بدون memo)" : "بدون تغییر"}
            </div>
          </motion.div>

          {/* Child 2: <FeedList /> (with its own state) */}
          <motion.div
            key={`feed-${animKey}`}
            animate={renderState.feed ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.3, delay: 0.08 }}
            className={`px-5 py-2.5 rounded-xl border text-center transition-all min-w-[140px] ${
              renderState.feed
                ? "bg-sky-50 border-sky-400 text-sky-950 shadow-md ring-2 ring-sky-200"
                : "bg-white border-[#E6E0D5] text-[#181A20] shadow-sm"
            }`}
          >
            <div className="font-mono text-xs font-bold flex items-center justify-center gap-1">
              <span>&lt;FeedList /&gt;</span>
              {renderState.feed && <span className="text-[10px] text-sky-700 bg-sky-100 px-1 rounded">Active</span>}
            </div>
            <div className="text-[10px] text-[#6B7280] font-mono mt-0.5">
              Local State: {feedCount}
            </div>
          </motion.div>

          {/* Child 3: <Sidebar /> (with memo option) */}
          <motion.div
            key={`sidebar-${animKey}`}
            animate={renderState.sidebar ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`px-4 py-2.5 rounded-xl border text-center transition-all min-w-[130px] ${
              renderState.sidebar
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-sm"
                : memoizeSidebar && renderState.app
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                : "bg-white border-[#E6E0D5] text-[#4A5260] shadow-sm"
            }`}
          >
            <div className="font-mono text-xs font-semibold flex items-center justify-center gap-1">
              <span>&lt;Sidebar /&gt;</span>
              {memoizeSidebar && renderState.app && (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
              )}
            </div>
            <div className="text-[10px] font-mono mt-0.5">
              {memoizeSidebar && renderState.app ? (
                <span className="text-emerald-700 font-medium">پرش از ریرندر ✓</span>
              ) : renderState.sidebar ? (
                <span className="text-amber-800">ری‌رندر شد</span>
              ) : (
                <span className="text-[#8C93A0]">آماده</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live Diagnostic Commentary Bar */}
      <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#F0EBE1] flex items-start gap-2.5 text-xs text-[#3E4452] leading-relaxed">
        <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#181A20] ml-1">تحلیل آنی رفتار ری‌اکت:</span>
          <span>{lastAction}</span>
        </div>
      </div>
    </div>
  );
}
