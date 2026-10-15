"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const modalVariants = {
  hidden: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
};

function RichTextRenderer({ content }) {
  if (!content) {
    return <p>No content available.</p>;
  }

  if (typeof content === 'string') {
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (!content.root || !content.root.children) {
    return <p>No content available.</p>;
  }

  function renderNode(node, index) {
    if (node.type === 'text') {
      let text = node.text;
      if (node.format & 1) text = <strong key={index}>{text}</strong>;
      if (node.format & 2) text = <em key={index}>{text}</em>;
      if (node.format & 8) text = <u key={index}>{text}</u>;
      if (node.format & 16) text = <code key={index} className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{text}</code>;
      return text;
    }

    if (node.type === 'linebreak') {
      return <br key={index} />;
    }

    if (node.type === 'horizontalrule') {
      return <hr key={index} className="my-4 border-gray-300 dark:border-gray-600" />;
    }

    if (node.type === 'paragraph') {
      return (
        <p key={index} className="mb-4">
          {node.children?.map((child, i) => renderNode(child, i))}
        </p>
      );
    }

    if (node.type === 'heading') {
      const Tag = node.tag || 'h1';
      return (
        <Tag key={index} className="font-bold mb-2 mt-4">
          {node.children?.map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    if (node.type === 'list') {
      const Tag = node.listType === 'number' ? 'ol' : 'ul';
      return (
        <Tag key={index} className="list-disc list-inside mb-4 pl-4">
          {node.children?.map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    if (node.type === 'listitem') {
      return (
        <li key={index} className="mb-1">
          {node.children?.map((child, i) => renderNode(child, i))}
        </li>
      );
    }

    if (node.type === 'code') {
      const getCodeText = (n) => {
        if (!n) return '';
        if (typeof n === 'string') return n;
        if (n.text) return n.text;
        if (n.type === 'linebreak') return '\n';
        if (n.children && Array.isArray(n.children)) return n.children.map(getCodeText).join('');
        return '';
      };
      const code = getCodeText(node);
      const language = node.language || 'javascript';
      return (
        <SyntaxHighlighter
          key={index}
          language={language}
          style={oneDark}
          customStyle={{
            borderRadius: '6px',
            margin: '0.5em 0',
          }}
          className="!text-xs sm:!text-sm md:!text-base"
        >
          {code}
        </SyntaxHighlighter>
      );
    }

    if (node.type === 'quote') {
      return (
        <blockquote key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-4">
          {node.children?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );
    }

    if (node.type === 'link') {
      return (
        <a
          key={index}
          href={node.fields?.url || '#'}
          target={node.fields?.newTab ? '_blank' : '_self'}
          rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
          className="text-blue-500 hover:underline"
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </a>
      );
    }

    // Default: render children
    if (node.children) {
      return (
        <span key={index}>
          {node.children.map((child, i) => renderNode(child, i))}
        </span>
      );
    }

    return null;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      {content.root.children.map((node, index) => renderNode(node, index))}
    </div>
  );
}

export default function TopicModal({ topicData, onClose }) {
  const topic = topicData;
  const loading = !topicData;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
      >
        <motion.div
          className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-4 sm:p-5 md:p-6 w-full max-w-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[95vh] shadow-2xl flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex-grow flex items-center justify-center text-center py-8 text-base sm:text-lg text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 flex-shrink-0">
                {topic?.title || "Topic Title"}
              </h2>
              <div
                className="text-gray-800 dark:text-gray-200 text-sm sm:text-base md:text-lg custom-scrollbar pr-2 sm:pr-3 flex-grow min-h-0"
                style={{ overflowY: 'auto' }}
              >
                {topic?.description ? (
                  <RichTextRenderer content={topic.description} />
                ) : (
                  'No content available.'
                )}
              </div>
              <button
                className="mt-4 sm:mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors text-sm sm:text-base flex-shrink-0"
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