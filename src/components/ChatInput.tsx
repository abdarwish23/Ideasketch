'use client';

import { useChatContext } from '@/contexts/ChatContext';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Send, Square } from 'react-feather';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  isGenerating?: boolean;
  setStopGeneration: (value: React.SetStateAction<boolean>) => void;
  abortControllerRef: React.RefObject<AbortController | null>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage = () => {}, // Default no-op function
  isGenerating = false,
  setStopGeneration,
  abortControllerRef,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { chats, createNewChat } = useChatContext();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isGenerating) {
      onSendMessage(message);
      setMessage(''); // Clear input after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  };

  useEffect(() => {
    if (!chats.length) {
      createNewChat();
    }
  }, [chats, createNewChat]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className='p-4 bg-gray-50 dark:bg-[#1B1C1D] pb-10'>
      <form onSubmit={handleSubmit} className='max-w-3xl mx-auto flex items-center space-x-3'>
        {/* Input field with state management */}
        <textarea
          ref={textareaRef}
          placeholder='Send a message...'
          className='flex-1 px-4 py-3 border resize-none border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1B1C1D] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400  max-h-40 overflow-y-auto'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isGenerating}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        {/* Submit button with disabled state */}
        {isGenerating ? (
          <button
            className='px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-200 ease-in-out cursor-pointer'
            onClick={() => {
              setStopGeneration(true);
              setTimeout(() => {
                abortControllerRef.current?.abort();
              }, 50);
            }}
          >
            {/* Stop */}

            <Square size={18} />
          </button>
        ) : (
          <button
            type='submit'
            className='px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-200 ease-in-out cursor-pointer'
            disabled={isGenerating || !message.trim()}
          >
            {/* Send */}
            <Send size={18} />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
