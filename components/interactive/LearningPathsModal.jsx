"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, ArrowRight, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

const LEARNING_PATHS = [
  {
    id: "fundamentals",
    title: "React Fundamentals",
    subtitle: "Core concepts, rendering cycles, and component identity.",
    level: "Beginner",
    levelColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    topics: [
      { title: "What is React?", slug: "what is react?" },
      { title: "Functional Components", slug: "functional components: syntax and why they're used" },
      { title: "JSX syntax & rules", slug: "jsx: syntax, curly braces, className" },
      { title: "Props passing", slug: "props: how to pass data (parent to child)" },
      { title: "Virtual DOM & Reconciliation", slug: "virtual dOM basics" },
    ],
  },
  {
    id: "hooks-deep-dive",
    title: "Hooks Deep Dive",
    subtitle: "State synchronization, lifecycle mastery, and closure traps.",
    level: "Common / Intermediate",
    levelColor: "bg-sky-50 text-sky-800 border-sky-200",
    topics: [
      { title: "useState & State snapshots", slug: "usestate" },
      { title: "useEffect & Async cleanups", slug: "useEffect" },
      { title: "useRef & DOM mutation", slug: "useref" },
      { title: "useCallback & useMemo", slug: "usecallback, usememo" },
      { title: "useContext & Providers", slug: "usecontext" },
    ],
  },
  {
    id: "component-architecture",
    title: "Component Architecture",
    subtitle: "Composition, colocation, and scalable code organization.",
    level: "Advanced",
    levelColor: "bg-purple-50 text-purple-800 border-purple-200",
    topics: [
      { title: "Component Composition", slug: "component composition" },
      { title: "Lifting State Up", slug: "lifting state up" },
      { title: "useReducer state machines", slug: "usereducer" },
      { title: "Custom Hooks design", slug: "creating custom hooks " },
      { title: "Avoiding Prop Drilling", slug: "Avoiding Prop drilling" },
    ],
  },
  {
    id: "performance-engineering",
    title: "Performance Engineering",
    subtitle: "Preventing re-render cascades and optimizing concurrent React.",
    level: "Advanced",
    levelColor: "bg-purple-50 text-purple-800 border-purple-200",
    topics: [
      { title: "React.memo isolation", slug: "react.memo()" },
      { title: "useTransition & deferred values", slug: "usetransition, usedeferredvalue " },
      { title: "Code Splitting & Suspense", slug: "Code splitting (React.lazy, Suspense)" },
      { title: "Virtualization & Lists", slug: "virtualization (react-window)" },
      { title: "React Profiler techniques", slug: "react profiler" },
    ],
  },
  {
    id: "react-19-modern",
    title: "React 19 & Fullstack Paradigm",
    subtitle: "Actions, Server Components, and the modern React compiler.",
    level: "Modern 19",
    levelColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    topics: [
      { title: "Server Actions Basics", slug: "Server Actions basics" },
      { title: "useActionState form handler", slug: "useactionstate" },
      { title: "useOptimistic UI rollbacks", slug: "useoptimistic" },
      { title: "use() hook with Suspense", slug: "use" },
      { title: "Server Components Fundamentals", slug: "Server Components fundamentals" },
    ],
  },
];

export default function LearningPathsModal({
  isOpen,
  onClose,
  masteredIds = new Set(),
  onSelectTopic,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-sans" dir="ltr">
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col space-y-6 z-10 text-left"
          >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Curated Learning Paths
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step-by-step engineering curriculum based on real production concepts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Paths Grid */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {LEARNING_PATHS.map((path) => (
              <div
                key={path.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {path.title}
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${path.levelColor}`}>
                        {path.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {path.subtitle}
                    </p>
                  </div>
                </div>

                {/* Topics in Sequence */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {path.topics.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectTopic({ slug: t.slug, title: t.title });
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs text-slate-700 font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span className="text-[10px] font-mono text-slate-400">
                        {idx + 1}.
                      </span>
                      <span>{t.title}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>5 structured paths covering all 90 React topics</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
