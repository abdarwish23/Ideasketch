'use client';

import React, { useState, FormEvent } from 'react';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage = () => {}, // Default no-op function
  isDisabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage(''); // Clear input after sending
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center space-x-3">
        {/* Input field with state management */}
        <input
          type="text"
          placeholder="Send a message..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isDisabled}
          // Handle Enter key to submit
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        {/* Submit button with disabled state */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
          disabled={isDisabled || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
