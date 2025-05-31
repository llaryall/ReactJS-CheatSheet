"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopicModal from "./TopicModal"; // Assuming you have a TopicModal component

const modalVariants = {
  hidden: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easOut" } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
};

// CaretDownIcon component (remains unchanged)
const CaretDownIcon = ({ open }) => (
  <svg
    className={`w-5 h-5 ml-2 inline-block transition-transform duration-300 ${
      open ? "rotate-180" : ""
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// CategoryItem component (remains unchanged)
function CategoryItem({ category, isOpen, onToggle, onTopicSelect }) {
  // Define the desired order of tiers for pagination
  const tierOrder = ["🟢", "🔵", "🟣"]; // Beginner, Common Use, Advanced (adjust as needed)

  // Group topics by their tier, maintaining the specified order
  const topicsGroupedByTier = tierOrder.reduce((acc, tierKey) => {
    const topicsInThisTier = category.topics.filter(topic => topic.tier === tierKey);
    if (topicsInThisTier.length > 0) {
      acc[tierKey] = topicsInThisTier;
    }
    return acc;
  }, {});

  // Get an ordered list of tiers that actually have topics in this category
  const availableTiersInOrder = Object.keys(topicsGroupedByTier);

  const [page, setPage] = useState(0);
  // totalPages is now the number of tiers that have topics
  const totalPages = availableTiersInOrder.length;

  // variants for topic pagination (not directly related to dropdown itself)
  const variants = {
    enter: (direction) => ({
      y: direction > 0 ? 100 : -100,
      opacity: 0,
      position: "absolute", // Note: position absolute here is for the topic list items during transition
    }),
    center: { y: 0, opacity: 1, position: "relative" },
    exit: (direction) => ({
      y: direction < 0 ? 100 : -100,
      opacity: 0,
      position: "absolute", // Note: position absolute here is for the topic list items during transition
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleDragEnd = (event, info) => {
    if (info.offset.y < -50 && page < totalPages - 1) {
      setDirection(1);
      setPage(page + 1);
    } else if (info.offset.y > 50 && page > 0) {
      setDirection(-1);
      setPage(page - 1);
    }
  };

  const handlePageUp = () => {
    if (page > 0) {
      setDirection(-1);
      setPage(page - 1);
    }
  };

  const handlePageDown = () => {
    if (page < totalPages - 1) {
      setDirection(1);
      setPage(page + 1);
    }
  };

  // Get the topics for the current page (tier)
  const currentTierKey = totalPages > 0 ? availableTiersInOrder[page] : null;
  const topicsToShow = currentTierKey ? topicsGroupedByTier[currentTierKey] : [];

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scaleY: 0.8,
      y: -20,
      filter: "blur(8px)",
      transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
    },
    visible: {
      opacity: 1,
      scaleY: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.38, type: "spring", bounce: 0.35 },
    },
    exit: {
      opacity: 0,
      scaleY: 0.8,
      y: 20,
      filter: "blur(8px)",
      transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="w-full max-w-sm md:max-w-[400px] min-w-[260px] mx-auto relative"> {/* Full width on small screens, max-width on medium+ */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0px 25px 25px rgba(127, 90, 240, 0.4)" }}
        transition={{ type: "spring", stiffness: 100, damping: 25, bounce: 0.1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex justify-between items-center p-4 md:p-6 text-base md:text-lg font-bold bg-white text-black dark:bg-gray-900/90 dark:text-white rounded-2xl shadow-2xl transition-all duration-300 border-2 ${ // Responsive padding and text size, updated dark mode bg and text
          isOpen ? "border-[#7F5AF0] shadow-[#7F5AF0]/20 dark:border-[#7F5AF0] dark:shadow-[#7F5AF0]" : "border-transparent"
        }`}
        style={{

        fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
      }}
      >
        <span className="truncate">{category.name}</span>
        <CaretDownIcon open={isOpen} />
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            // The key for the dropdown content itself is `page` for your topic pagination animation.
            // This is fine. The outer CategoryItem will have its own key from the list.
            key={page}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              originY: 0,
              overflow: "hidden",
              touchAction: "pan-y",
              cursor: "grab",
            }}
            className="p-4 md:p-6 space-y-3 md:space-y-5 bg-[#FFFBF5]/95 dark:bg-gray-900/90 rounded-b-2xl shadow-xl mt-2 ring-1 ring-[#E0E0E0] dark:ring-[#7F5AF0]/40" // Responsive padding and spacing
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-center mb-2">
              <button
                onClick={handlePageUp}
                disabled={page === 0}
                className="text-sm md:text-base px-3 py-1 rounded bg-[#7F5AF0]/10 text-[#7F5AF0] dark:bg-[#7F5AF0]/30 dark:text-white disabled:opacity-40 font-bold shadow" // Responsive text size
                aria-label="Previous"
              >
                ▲
              </button>
            </div>
            {totalPages === 0 ? (
              <p className="text-base text-[#3D3D3D]/70 dark:text-gray-400">
                No topics in this category yet.
              </p>
            ) : (
              <>
                
                {topicsToShow.map((topic) => (
                  <button
                    type="button"
                    key={topic.id}
                    onClick={() => onTopicSelect(topic)} // Pass the full topic object
                    className="block w-full text-left p-2.5 md:p-3 text-sm md:text-base text-[#3D3D3D] dark:text-gray-100 hover:bg-[#7F5AF0]/10 dark:hover:bg-[#7F5AF0]/20 rounded-xl font-semibold transition-all duration-200" // Responsive padding and text size
                  > 
                    <span className="flex items-center"> {/* Changed to items-center for better vertical alignment of badge and text */}
                    <span className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded font-bold shadow-sm mr-2 ${ // Responsive padding for tier badge, removed mt-1
                        topic.tier === "🟢"
                          ? "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100"
                          : ""
                      }
                      ${
                        topic.tier === "🔵"
                          ? "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100"
                          : ""
                      }
                      ${
                        topic.tier === "🟣"
                          ? "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100"
                          : ""
                      }
                    `}
                    >
                      {topic.tier}
                    </span>
                    <span className="ml-1 md:ml-2 break-words flex-1">{topic.title}</span> {/* Added flex-1 for better text wrapping */}
                    </span>
                  </button>
                ))}
                <div className="flex justify-center items-center mt-2">
                  <span className="text-sm md:text-base text-[#3D3D3D]/70 dark:text-gray-500 flex items-center"> {/* Responsive text size */}
                    {currentTierKey && <span className="mr-1">{currentTierKey}</span>} 
                    ({page + 1} / {totalPages})
                    

                  </span>
                </div>
              </>
            )}
            <div className="flex justify-center mt-2">
              <button
                onClick={handlePageDown}
                disabled={
                  page === totalPages - 1 || category.topics.length === 0
                }
                className="text-sm md:text-base px-3 py-1 rounded bg-[#7F5AF0]/10 text-[#7F5AF0] dark:bg-[#7F5AF0]/30 dark:text-white disabled:opacity-40 font-bold shadow" // Responsive text size
                aria-label="Next"
              >
                ▼
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Adjusted InteractiveCategoryList component
export default function InteractiveCategoryList({ categoriesWithTopics }) {
  const [openIds, setOpenIds] = useState([]);
  const [selectedTopicData, setSelectedTopicData] = useState(null); // Changed state name and type

  const handleToggle = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
    );
  };

  // 1. Prepare data for three columns
  const columnsData = [[], [], []]; // Array for each column
  if (categoriesWithTopics && categoriesWithTopics.length > 0) {
    categoriesWithTopics.forEach((category, index) => {
      columnsData[index % 3].push(category); // Distribute categories
    });
  }

  return (
    // Main container: flex-col by default, md:flex-row for medium screens and up.
    // Adjusted gap and padding for responsiveness.
    <div className="w-full flex flex-col md:flex-row gap-6 md:gap-x-8 lg:gap-x-10 px-0 sm:px-2 md:px-4">
      {columnsData.map((columnItems, colIndex) => (
        <div
          key={`column-${colIndex}`} // Unique key for each column div
          className="flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 md:flex-1 w-full px-2 sm:px-0" // Each column: vertical gap, equal width on md+, full width for items within column on smaller screens
        >
          {columnItems.map((category) => (
            <CategoryItem
              key={category.id} // Key for the CategoryItem itself
              category={category}
              isOpen={openIds.includes(category.id)}
              onToggle={() => handleToggle(category.id)}
              onTopicSelect={setSelectedTopicData} // Pass down the function to set selected topic data
            />
          ))}
        </div>
      ))}

      {selectedTopicData && (
        <TopicModal
          topicData={selectedTopicData} // Pass full topic data
          onClose={() => setSelectedTopicData(null)}
        />
      )}
    </div>
  );
}
