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
      <div className="mb-16 px-4 md:px-0">
        <input
          type="text"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 dark:border-gray-700/50 rounded-lg w-full max-w-xl mx-auto block bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-[0_8px_20px_rgba(127,90,240,0.12)] focus:shadow-[0_10px_25px_rgba(127,90,240,0.2)] dark:shadow-[0_8px_20px_rgba(127,90,240,0.08)] dark:focus:shadow-[0_10px_25px_rgba(127,90,240,0.15)] transition-all duration-200"
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