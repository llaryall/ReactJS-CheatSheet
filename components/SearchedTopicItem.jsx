"use client";

// Helper to get tier badge styles
const getTierBadgeClasses = (tier) => {
  switch (tier) {
    case "🟢":
      return "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100";
    case "🔵":
      return "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100";
    case "🟣":
      return "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100";
    default:
      return "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"; // Fallback
  }
};

export default function SearchedTopicItem({ topic, onTopicClick }) {
  return (
    <button
      type="button"
      onClick={() => onTopicClick(topic.id)}
      className="w-full text-left p-3 sm:p-4 mb-3 bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      style={{ fontFamily: "'Quicksand', 'Segoe UI', sans-serif" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0"> {/* Added min-w-0 for better truncation if needed */}
          <span className={`text-xs px-2 py-1 rounded font-bold shadow-sm mr-3 flex-shrink-0 ${getTierBadgeClasses(topic.tier)}`}>
            {topic.tier}
          </span>
          <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-white truncate">
            {topic.title}
          </span>
        </div>
        {topic.categoryName && (
          <span className="text-xs text-slate-500 dark:text-gray-300 ml-2 whitespace-nowrap flex-shrink-0">
            in {topic.categoryName}
          </span>
        )}
      </div>
    </button>
  );
}