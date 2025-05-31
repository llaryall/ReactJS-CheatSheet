"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import parse, { domToReact } from 'html-react-parser';

const modalVariants = {
  hidden: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
};

export default function TopicModal({ topicData, onClose }) { // Changed prop from topicId to topicData
  // No more internal fetching or loading state needed if topicData is always provided
  const topic = topicData;
  const loading = !topicData; // Simple loading check based on prop presence

  return (
    <AnimatePresence>
      {/* Removed console.log related to topicId */}
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto" // Darker backdrop, responsive padding, overflow-y-auto for safety
        onClick={onClose}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
      >
        <motion.div
          className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-4 sm:p-5 md:p-6 w-full max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[95vh] shadow-2xl flex flex-col" // Responsive width, max-height, padding, and ensure flex column layout
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <>
              <div className="flex-grow flex items-center justify-center text-center py-8 text-base sm:text-lg text-gray-500 dark:text-gray-400">Loading...</div> {/* Use flex-grow */}
            </>
          ) : (
            <> {/* This fragment is fine, the parent motion.div is already flex-col */}
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 flex-shrink-0"> {/* Responsive text, flex-shrink-0 */}
                {topic?.title || "Topic Title"}
              </h2>
              <div
                className="text-gray-800 dark:text-gray-200 text-sm sm:text-base md:text-lg custom-scrollbar pr-2 sm:pr-3 flex-grow min-h-0" // Responsive text, flex-grow, min-h-0 for scroll in flex
                style={{
                  overflowY: 'auto',
                  // flex: 1, // Replaced by flex-grow
                  // minHeight: 0, // Still good for flex item scrolling
                  // maxHeight: '60vh', // Let flex-grow and parent max-h control this
                }}
              >
                {topic?.description
                  ? parse(topic.description, {
                      replace: domNode => {
                        if (domNode.name === 'pre' && domNode.children && domNode.children[0]?.name === 'code') {
                          const codeNode = domNode.children[0];
                          const codeText = codeNode.children[0]?.data || '';
                          const language = codeNode.attribs?.class?.replace('language-', '') || 'javascript';
                          return (
                            <SyntaxHighlighter
                              language={language}
                              style={oneDark}
                              customStyle={{ 
                                borderRadius: '6px', // Slightly smaller border radius
                                margin: '0.5em 0', // Add some vertical margin
                              }}
                              className="!text-xs sm:!text-sm md:!text-base" // Responsive font size for code
                            >
                              {codeText}
                            </SyntaxHighlighter>
                          );
                        }
                      },
                    })
                  : 'No content available.'}
              </div>
              <button
                className="mt-4 sm:mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base flex-shrink-0" // Responsive margin-top and text, flex-shrink-0
                onClick={onClose}
              >
                Close
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}