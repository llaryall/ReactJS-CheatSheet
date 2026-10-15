"use client";

import { useState } from "react";
import { Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: "Quick Quiz",
    subtitle: "Find the bug in this code.",
    code: `function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
    console.log(count);
  }
  return <button onClick={handleClick}>{count}</button>;
}`,
    options: [
      { id: "nobug", label: "No bug, this works fine", isCorrect: false },
      { id: "stale", label: "Logs the old value (stale state)", isCorrect: true },
      { id: "async", label: "setCount is async", isCorrect: false },
      { id: "callback", label: "Need to use useCallback", isCorrect: false },
    ],
    explanation:
      "Correct! React state updates are scheduled for the next render. Inside handleClick, count retains the snapshot value of the current render.",
  },
  {
    id: 2,
    title: "Quick Quiz",
    subtitle: "What is wrong with this interval effect?",
    code: `function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }, []); // Mount effect

  return <div>{seconds}s</div>;
}`,
    options: [
      { id: "cleanup", label: "Memory leak: missing cleanup function to clearInterval", isCorrect: true },
      { id: "deps", label: "Missing seconds in dependency array", isCorrect: false },
      { id: "loop", label: "Causes infinite re-render loop immediately", isCorrect: false },
      { id: "syntax", label: "setInterval cannot run inside useEffect", isCorrect: false },
    ],
    explanation:
      "Correct! If the component unmounts, the interval continues running in memory forever. Always return () => clearInterval(id); as cleanup.",
  },
  {
    id: 3,
    title: "Quick Quiz",
    subtitle: "Identify the object dependency trap.",
    code: `function SearchResults({ query }: { query: string }) {
  const [data, setData] = useState([]);
  const params = { q: query, page: 1 };

  useEffect(() => {
    api.search(params).then(res => setData(res));
  }, [params]);

  return <List items={data} />;
}`,
    options: [
      { id: "infloop", label: "Infinite loop: params is a new object reference on every render", isCorrect: true },
      { id: "syntax", label: "Invalid dependency syntax", isCorrect: false },
      { id: "state", label: "params must be managed with useState", isCorrect: false },
      { id: "nobug", label: "No bug, works as intended", isCorrect: false },
    ],
    explanation:
      "Correct! In JavaScript, {} !== {}. On every render params gets a new reference, triggering the effect again in an infinite loop.",
  },
];

export default function MicroQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("stale");
  const [submitted, setSubmitted] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex] || QUIZ_QUESTIONS[0];
  const selectedObj = currentQ.options.find((opt) => opt.id === selectedOption);
  const isCorrect = selectedObj?.isCorrect;

  const handleSelectOption = (optId) => {
    if (!submitted) {
      setSelectedOption(optId);
    }
  };

  const handleCheck = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % QUIZ_QUESTIONS.length;
    setCurrentIndex(nextIdx);
    setSelectedOption(QUIZ_QUESTIONS[nextIdx].options[0].id);
    setSubmitted(false);
  };

  return (
    <div
      className="w-full h-full rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-white/80 p-5 sm:p-6 shadow-[0_15px_40px_-5px_rgba(30,41,59,0.05)] text-left font-sans flex flex-col justify-between"
      dir="ltr"
    >
      {/* Header matching Reference */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{currentQ.title}</h4>
              <p className="text-[11px] text-slate-500">{currentQ.subtitle}</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {currentIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>

        {/* Code Snippet Box */}
        <div className="rounded-xl border border-slate-800 bg-[#1A1F2C] overflow-hidden text-left mb-3">
          <SyntaxHighlighter
            language="javascript"
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
            {currentQ.code}
          </SyntaxHighlighter>
        </div>

        {/* Radio Options matching Reference */}
        <div className="space-y-1.5 mb-3">
          {currentQ.options.map((opt) => {
            const isThisSelected = selectedOption === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isThisSelected
                    ? "bg-slate-50 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50/60"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isThisSelected
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isThisSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-[11px] sm:text-xs leading-snug">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Feedback & Actions */}
      <div>
        {submitted && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isCorrect ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              )}
            </div>
            <p className="text-[11px] leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!submitted ? (
            <button
              type="button"
              onClick={handleCheck}
              className="w-full py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
