"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  BookOpen,
  Sparkles,
  Cpu,
  Search,
  Command,
  Play,
  ArrowRight,
  Sun,
} from "lucide-react";
import ReactAtomVisualizer from "@/components/interactive/ReactAtomVisualizer";
import TopicExplorerCard from "@/components/interactive/TopicExplorerCard";
import GotchaRadarCard from "@/components/interactive/GotchaRadarCard";
import DecisionTree from "@/components/interactive/DecisionTree";
import MicroQuiz from "@/components/interactive/MicroQuiz";
import CodeComparison from "@/components/interactive/CodeComparison";
import CommandPalette from "@/components/CommandPalette";
import BrowseModal from "@/components/interactive/BrowseModal";
import LearningPathsModal from "@/components/interactive/LearningPathsModal";
import AllGotchasModal from "@/components/interactive/AllGotchasModal";
import AllDecisionTreesModal from "@/components/interactive/AllDecisionTreesModal";
import AllComparisonsModal from "@/components/interactive/AllComparisonsModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function HomepageComposition({ initialCategories, currentLocale = "en" }) {
  const [activeTopic, setActiveTopic] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [isPathsOpen, setIsPathsOpen] = useState(false);
  const [isGotchasOpen, setIsGotchasOpen] = useState(false);
  const [isTreesOpen, setIsTreesOpen] = useState(false);
  const [isComparisonsOpen, setIsComparisonsOpen] = useState(false);

  const isFa = currentLocale === "fa";

  // Global shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allTopics = initialCategories.flatMap((cat) =>
    cat.topics.map((t) => ({ ...t, categoryName: cat.name }))
  );
  const totalTopicsCount = allTopics.length;

  const handleSelectTopic = (topic) => {
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="w-full min-h-screen living-canvas-backdrop text-slate-800 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900"
      dir={isFa ? "rtl" : "ltr"}
    >
      {/* 1. Navigation Bar matching Reference */}
      <header className="h-16 shrink-0 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <Link href={`/${currentLocale}`} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold text-sm shadow-2xs">
              ⚛
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">
              {isFa ? "چیت‌شیت ری‌اکت" : "React Cheat Sheet"}
            </span>
          </Link>

          {/* Navigation Links matching Reference: Browse, Learning Paths, Tools, About */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setIsBrowseOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isFa ? "کاوش موضوعات" : "Browse"}
            </button>
            <button
              type="button"
              onClick={() => setIsPathsOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isFa ? "مسیرهای یادگیری" : "Learning Paths"}
            </button>
            <a href="#tools" className="hover:text-slate-900 transition-colors">
              {isFa ? "ابزارها" : "Tools"}
            </a>
            <a href="#about" className="hover:text-slate-900 transition-colors">
              {isFa ? "درباره" : "About"}
            </a>
          </nav>
        </div>

        {/* Right: Search, Language Switcher & Theme Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs text-slate-500 font-sans hover:border-slate-300 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] hidden sm:inline">
              {isFa ? "جستجوی مفاهیم..." : "Search topics..."}
            </span>
            <kbd className="px-1.5 py-0.2 rounded bg-white text-[10px] font-mono text-slate-600 border border-slate-200">
              ⌘ K
            </kbd>
          </button>

          {/* Language Switcher Component */}
          <LanguageSwitcher currentLocale={currentLocale} />

          <button
            type="button"
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* UPPER SECTION: TWO EQUAL LARGE CARDS SIDE-BY-SIDE matching Reference */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* CARD 1 (Top Left): Discover React ("Master React. Smarter.") */}
          <div className="glass-panel rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_-10px_rgba(15,23,42,0.06)] min-h-[500px]">
            {/* Soft Gradient Backlight */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sky-200/40 via-indigo-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Upper Content with Headline & 3D React Atom Sculpture */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-1">
              {/* Left Headline & CTAs */}
              <div className="space-y-5 max-w-sm sm:max-w-md pt-1">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  {isFa ? (
                    <>
                      مهندسی ری‌اکت.
                      <br />
                      <span className="text-slate-900">هوشمندانه‌تر.</span>
                    </>
                  ) : (
                    <>
                      Master React.
                      <br />
                      <span className="text-slate-900">Smarter.</span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-xs sm:max-w-sm">
                  {isFa
                    ? "چیت‌شیت مدرن و راهنمای تعاملی مهندسی ری‌اکت برای درک عمیق پروداکشن."
                    : "A modern, interactive cheat sheet and engineering guide for React developers."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsBrowseOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{isFa ? "شروع کاوش" : "Start Exploring"}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isFa ? "rotate-180" : ""}`} />
                  </button>

                  <Link
                    href={`/${currentLocale}/topic/useeffect`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-semibold text-xs transition-all shadow-2xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                    <span>{isFa ? "مشاهده دمو" : "Watch Demo"}</span>
                  </Link>
                </div>
              </div>

              {/* Right: 3D React Atom Sculpture matching Reference */}
              <div className="shrink-0">
                <ReactAtomVisualizer />
              </div>
            </div>

            {/* Bottom Floating Stats Pill Banner matching Reference */}
            <div className="mt-6 rounded-2xl bg-white/90 border border-slate-100 p-3 sm:p-4 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {isFa ? "۹ دسته‌بندی" : "9 Categories"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFa ? "پوشش کامل اکوسیستم" : "Complete coverage"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-2 pt-2 sm:pt-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {totalTopicsCount} {isFa ? "موضوع" : "Topics"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFa ? "از ریشه تا سایبان" : "From basics to advanced"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-2 pt-2 sm:pt-0">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {isFa ? "یادگیری تعاملی" : "Interactive Learning"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFa ? "شبیه‌ساز و کوئیز" : "Learn by doing"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-2 pt-2 sm:pt-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {isFa ? "تمرکز مهندسی" : "Engineering Focus"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFa ? "الگوهای پروداکشن" : "Real-world patterns"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 (Top Right): Topic Explorer Card ("useEffect") */}
          <div className="min-h-[500px]">
            <TopicExplorerCard
              activeTopic={activeTopic}
              onResetTopic={() => setActiveTopic(null)}
              onOpenBrowse={() => setIsBrowseOpen(true)}
              currentLocale={currentLocale}
            />
          </div>
        </section>

        {/* LOWER SECTION: FOUR SMALLER INTERACTIVE CARDS IN A 4-COLUMN ROW matching Reference */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch" id="tools">
          {/* Card 3 (Bottom Left): Gotcha & Anti-Pattern Radar (Dark Glass) */}
          <GotchaRadarCard
            onSelectTopic={handleSelectTopic}
            onOpenAllGotchas={() => setIsGotchasOpen(true)}
            onOpenPalette={() => setIsPaletteOpen(true)}
            currentLocale={currentLocale}
          />

          {/* Card 4 (Bottom Mid-Left): Decision Tree Card */}
          <DecisionTree
            onOpenAllTrees={() => setIsTreesOpen(true)}
            currentLocale={currentLocale}
          />

          {/* Card 5 (Bottom Mid-Right): Quick Quiz Card */}
          <MicroQuiz currentLocale={currentLocale} />

          {/* Card 6 (Bottom Right): Code Comparison Card */}
          <CodeComparison
            onOpenAllComparisons={() => setIsComparisonsOpen(true)}
            currentLocale={currentLocale}
          />
        </section>
      </main>

      {/* Footer matching Reference */}
      <footer className="border-t border-slate-200/80 bg-white/40 py-8 px-6 text-center text-xs text-slate-500 font-sans mt-8" id="about">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">React Cheat Sheet</span>
            <span>•</span>
            <span>
              {isFa
                ? "مرجع تعاملی مهندسی ری‌اکت برای توسعه‌دهندگان"
                : "A modern interactive engineering guide for React developers"}
            </span>
          </div>
          <div className="font-mono text-[11px]">
            React 18 & 19 Ready • Next.js App Router • Payload CMS 3
          </div>
        </div>
      </footer>

      {/* Global Command Palette Overlay (⌘K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        topics={allTopics}
        onSelectTopic={handleSelectTopic}
        currentLocale={currentLocale}
      />

      {/* Browse All Topics Modal */}
      <BrowseModal
        isOpen={isBrowseOpen}
        onClose={() => setIsBrowseOpen(false)}
        categories={initialCategories}
        onSelectTopic={handleSelectTopic}
        currentLocale={currentLocale}
      />

      {/* Curated Learning Paths Modal */}
      <LearningPathsModal
        isOpen={isPathsOpen}
        onClose={() => setIsPathsOpen(false)}
        onSelectTopic={handleSelectTopic}
        currentLocale={currentLocale}
      />

      {/* All Gotchas & Anti-Patterns Modal */}
      <AllGotchasModal
        isOpen={isGotchasOpen}
        onClose={() => setIsGotchasOpen(false)}
        onSelectTopic={handleSelectTopic}
        currentLocale={currentLocale}
      />

      {/* All Decision Trees Modal */}
      <AllDecisionTreesModal
        isOpen={isTreesOpen}
        onClose={() => setIsTreesOpen(false)}
        onSelectTopic={handleSelectTopic}
        currentLocale={currentLocale}
      />

      {/* All Code Comparisons Modal */}
      <AllComparisonsModal
        isOpen={isComparisonsOpen}
        onClose={() => setIsComparisonsOpen(false)}
        currentLocale={currentLocale}
      />
    </div>
  );
}
