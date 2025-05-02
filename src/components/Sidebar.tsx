'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'react-feather';
import { useChatContext } from '@/contexts/ChatContext';

// Chat history item interface
interface ChatHistoryItem {
  id: string;
  title: string;
}

// Clean, consistent SidebarProps interface
interface SidebarProps {
  chatHistory: ChatHistoryItem[];
  onSelectChat?: (id: string) => void;
  onCreateNewChat?: () => void;
  currentChatId?: string | null;
  // For controlled component
  isCollapsed?: boolean;
  onToggleCollapse?: (isCollapsed: boolean) => void;
  // Default collapsed state (for uncontrolled component)
  defaultCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  chatHistory = [],
  onSelectChat = () => {},
  onCreateNewChat = () => {},
  currentChatId = null,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
  defaultCollapsed = false,
}) => {
  // Use internal state if no external control is provided
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(defaultCollapsed);
  const { deleteChatHistory, deleteChatById } = useChatContext();

  // Determine if sidebar is collapsed (controlled or uncontrolled)
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    } else {
      setInternalIsCollapsed(newState);
    }
  };

  return (
    <div className='flex h-full relative'>
      <div
        className={`h-full bg-neutral dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-12' : 'w-0'}
        `}
      />
      <div
        className={`h-full bg-neutral dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}
          overflow-hidden
        `}
      >
        <div className='p-4 w-64 flex flex-col h-full'>
          {/* App title */}
          <h1 className='mb-4 text-center font-bold text-2xl text-neutral-800 dark:text-neutral-100'>Ideasketch</h1>
          {/* New chat button */}
          <button
            onClick={onCreateNewChat}
            className='mb-4 w-full px-4 py-2 bg-primary text-white text-base font-medium rounded-md hover:bg-primary-dark focus:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-primary transition duration-150 ease-in-out hover:cursor-pointer flex items-center justify-center gap-2'
          >
            <PlusCircle size={16} />
            <span>New Chat</span>
          </button>
          {/* Delete chat history button */}
          <button
            onClick={deleteChatHistory}
            className='mb-4 w-full px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md hover:bg-red-700 focus:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-red-500 transition duration-150 ease-in-out hover:cursor-pointer flex items-center justify-center gap-2'
          >
            <span>Delete History</span>
          </button>
          {/* Chat history section */}
          <h2 className='text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-3 px-1'>Chat History</h2>
          {/* Chat list with improved styling */}
          <div className='flex-1 overflow-y-auto -mx-1'>
            {chatHistory.length === 0 ? (
              <p className='text-sm text-neutral-600 dark:text-neutral-400 px-1 animate-pulse'>No chats yet.</p>
            ) : (
              <ul className='space-y-1'>
                {chatHistory.map((chat) => (
                  <li
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`
                      px-3 py-2 rounded-md cursor-pointer text-sm truncate
                      ${
                        currentChatId === chat.id
                          ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }
                    `}
                    title={chat.title}
                  >
                    {chat.title}
                    <button onClick={() => deleteChatById(chat.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer section for future use */}
          <div className='mt-auto pt-4'>{/* Settings or user info could go here */}</div>
        </div>
      </div>

      {/* Toggle button - positioned at the edge */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute top-4 z-10
          ${isCollapsed ? 'left-3' : 'left-60'} 
          w-7 h-7 
          flex items-center justify-center 
          bg-neutral dark:bg-neutral-800 
          border border-neutral-200 dark:border-neutral-700 
          rounded-full shadow-sm 
          hover:bg-neutral-200 dark:hover:bg-neutral-700 
          transition-all duration-300 ease-in-out
          hidden
          lg:flex
        `}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
};

export default Sidebar;
