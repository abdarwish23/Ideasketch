import React, { useRef, useEffect } from 'react';

// Define message types later (user, assistant, system)
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(({ messages }, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  return (
    // Add background, padding, and max-width for better readability
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white dark:bg-[#1B1C1D]" ref={ref}>
      <div className="max-w-3xl mx-auto space-y-4 scroll-x h-[20vh]">
        {messages.length === 0 ? (
          <p className='text-center text-gray-500 dark:text-gray-400'>Start the conversation by typing below.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              // Use flex to align messages left/right
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                // Improved styling for message bubbles
                className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white' // User message style
                    : message.role === 'system'
                    ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100 opacity-80'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100' // Assistant message style
                }`}
              >
                {/* Basic rendering for now, Markdown support later */}
                {/* Add whitespace preservation */}
                <p className='whitespace-pre-wrap break-words'>{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
