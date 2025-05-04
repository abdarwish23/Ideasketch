'use client';
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm'; // Import remark-gfm for table support

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
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Track messages for determining when we should scroll
  const previousMessagesLengthRef = useRef(messages.length);
  const previousLastMessageRef = useRef<Message | null>(null);
  const isUserScrollingRef = useRef(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Initialize scroll position when component mounts
  useEffect(() => {
    scrollToBottom('auto');

    // Set initial values for references on first render
    if (previousLastMessageRef.current === null && messages.length > 0) {
      previousLastMessageRef.current = { ...messages[messages.length - 1] };
    }
  }, [messages]);

  // Handle scroll events to detect when user manually scrolls up
  useEffect(() => {
    const containerElement = ref && 'current' in ref ? ref.current : null;
    if (!containerElement) return;

    const handleScroll = () => {
      // Mark that user is actively scrolling
      isUserScrollingRef.current = true;

      // Clear the flag after a short delay
      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);

      // Distance from bottom of scroll container
      const { scrollTop, scrollHeight, clientHeight } = containerElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // If within 100px of bottom, enable auto-scroll, otherwise disable it
      const newAutoScrollValue = distanceFromBottom < 100;

      // Only update if the value is changing to avoid unnecessary re-renders
      if (newAutoScrollValue !== autoScrollEnabled) {
        setAutoScrollEnabled(newAutoScrollValue);
      }
    };

    containerElement.addEventListener('scroll', handleScroll);
    return () => containerElement.removeEventListener('scroll', handleScroll);
  }, [ref, autoScrollEnabled]);

  // Handle auto-scrolling when messages change
  useEffect(() => {
    const currentMessagesLength = messages.length;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const previousLastMessage = previousLastMessageRef.current;

    // Case 1: New message added (always scroll to this, regardless of user scroll position)
    if (currentMessagesLength > previousMessagesLengthRef.current) {
      scrollToBottom();
      // When a new message starts, reset auto-scroll to true
      setAutoScrollEnabled(true);
    }

    // Case 2: Last message content is growing (streaming)
    else if (lastMessage && previousLastMessage && lastMessage.id === previousLastMessage.id && lastMessage.content.length > previousLastMessage.content.length) {
      // Only scroll if user hasn't manually scrolled up
      if (autoScrollEnabled) {
        scrollToBottom();
      }
    }

    // Update our references
    previousMessagesLengthRef.current = currentMessagesLength;
    previousLastMessageRef.current = lastMessage ? { ...lastMessage } : null;
  }, [messages, autoScrollEnabled]);

  return (
    <div className='flex-1 overflow-y-auto p-4 md:p-6 bg-white dark:bg-[#1B1C1D]' ref={ref}>
      <div className='max-w-3xl mx-auto space-y-4 scroll-x h-[20vh]'>
        {messages.length === 0 ? (
          <p className='text-center text-gray-500 dark:text-gray-400 animate-pulse font-extralight text-lg '>Start the conversation by typing below.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div
                className={`max-w-full lg:max-w-[95%] px-4 py-2 rounded-lg shadow-sm animate-fadeIn break-words overflow-auto ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white' // User message style
                    : message.role === 'system'
                    ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100 opacity-80'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100' // Assistant message style
                }`}
              >
                {/* Render Markdown with improved table support */}
                <div className={`whitespace-pre-wrap break-words ${message.content === '...' ? 'animate-pulse font-bold text-2xl' : 'animate-fadeIn'}`}>
                  <ReactMarkdown
                    key={message.id}
                    remarkPlugins={[remarkGfm]} // Add remark-gfm plugin for tables
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <div className='rounded-md overflow-hidden my-4 border border-gray-300 dark:border-gray-700'>
                            <div className='flex items-center justify-between bg-gray-200 dark:bg-gray-800 px-4 py-2 text-sm'>
                              <span className='font-medium text-gray-600 dark:text-gray-300'>{match[1].toUpperCase()}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(String(children));
                                  // You could add a toast notification here
                                }}
                                className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition'
                                aria-label='Copy code'
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                >
                                  <rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect>
                                  <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
                                </svg>
                              </button>
                            </div>
                            <SyntaxHighlighter
                              language={match[1]}
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                borderRadius: 0,
                                padding: '1rem',
                                fontSize: '0.9rem',
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono' {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Custom table styles to ensure proper rendering
                      table({ ...props }) {
                        return (
                          <div className='overflow-x-auto my-4'>
                            <table className='min-w-full border border-gray-300 dark:border-gray-700' {...props} />
                          </div>
                        );
                      },
                      thead({ ...props }) {
                        return <thead className='bg-gray-100 dark:bg-gray-800' {...props} />;
                      },
                      tbody({ ...props }) {
                        return <tbody className='divide-y divide-gray-200 dark:divide-gray-700' {...props} />;
                      },
                      tr({ ...props }) {
                        return <tr className='hover:bg-gray-50 dark:hover:bg-gray-900' {...props} />;
                      },
                      th({ ...props }) {
                        return <th className='px-3 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-700 last:border-r-0' {...props} />;
                      },
                      td({ ...props }) {
                        return <td className='px-3 py-2 border-r border-gray-300 dark:border-gray-700 last:border-r-0' {...props} />;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
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
