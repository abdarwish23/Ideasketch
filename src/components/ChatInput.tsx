import React from 'react';

// TODO: Add props for value, onChange, onSubmit later
const ChatInput = () => {
  return (
    // Add background, padding, border, and center content
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto flex items-center space-x-3">
        {/* Improved input field styling */}
        <input
          type="text"
          placeholder="Send a message..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          // Add value and onChange later
        />
        {/* Improved button styling */}
        <button
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
          // Add onClick/onSubmit and disabled state later
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
