"use client";

import { useState, useMemo } from 'react';
import InteractiveCategoryList from "@/components/InteractiveCategoryList";
import SearchedTopicItem from "@/components/SearchedTopicItem"; // Import the new component
import TopicModal from "@/components/TopicModal"; // Import TopicModal

export default function TopicBrowser({ initialCategories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicData, setSelectedTopicData] = useState(null); // Changed state name and type

  const filteredTopics = useMemo(() => {
    if (!initialCategories) return [];
    if (!searchTerm.trim()) {
      return []; // Return empty if no search term, InteractiveCategoryList will use initialCategories
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    let allMatchingTopics = [];

    initialCategories.forEach(category => {
      category.topics.forEach(topic => {
        if (topic.title.toLowerCase().includes(lowercasedSearchTerm)) {
          allMatchingTopics.push({
            ...topic, // Spread all original topic fields
            categoryName: category.name // Add category name for context
          });
        }
      });
    });
    return allMatchingTopics;
  }, [initialCategories, searchTerm]);

  const handleTopicSelect = (topicId) => {
    setSelectedTopicData(topicId); // This should now receive the full topic object
  };

  const handleCloseModal = () => {
    setSelectedTopicData(null);
  };

  return (
    <>
      {/* Increased bottom margin for more space below the search bar */}
      {/* Changed bottom margin from mb-14 to mb-16 */}
      <div className="mb-16 px-2 sm:px-4 md:px-0 flex justify-center">
        <input
          type="text"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            max-w-xs
            sm:max-w-md
            md:max-w-xl
            lg:max-w-2xl
            px-3 py-2
            sm:px-5 sm:py-3
            rounded-2xl
            bg-white/80
            dark:bg-gray-900/80
            border border-gray-200 dark:border-gray-700
            shadow-lg
            focus:outline-none
            focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500
            transition-all
            duration-200
            text-sm sm:text-base
            placeholder-gray-400 dark:placeholder-gray-500
            backdrop-blur
            font-semibold
            "
          style={{
            fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
            letterSpacing: "0.01em"
          }}
        />
      </div>

      {!searchTerm.trim() ? (
        // Show category list if no search term
        <InteractiveCategoryList
          categoriesWithTopics={initialCategories}
          onTopicSelect={setSelectedTopicData} // Pass the handler to set selected topic data
        />
      ) : filteredTopics.length > 0 ? (
        // Show filtered topics if search term and results exist
        <div className="mt-6 space-y-1 px-1 sm:px-2 md:px-0 max-w-3xl mx-auto"> {/* Container for searched topics */}
          {filteredTopics.map(topic => (
            <SearchedTopicItem
              key={topic.id}
              topic={topic}
              onTopicClick={setSelectedTopicData} // Pass the handler to set selected topic data
            />
          ))}
        </div>
      ) : (
        // Show no results message if search term but no results
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-lg">
          No topics found matching your search criteria.
        </p>
      )}

      {selectedTopicData && (
        <TopicModal topicData={selectedTopicData} onClose={handleCloseModal} />
      )}
    </>
  );
}