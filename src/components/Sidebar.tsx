'use client'


import React from 'react';

// Placeholder for chat history items
interface ChatHistoryItem {
  id: string;
  title: string;
}

interface SidebarProps {
  chatHistory: ChatHistoryItem[];
  onSelectChat?: (id: string) => void; // Make optional
  onCreateNewChat?: () => void; // Make optional
  currentChatId?: string | null; // Add current chat ID to highlight active chat
}

const Sidebar: React.FC<SidebarProps> = ({
  chatHistory,
  // Provide default no-op functions if props are not passed
  onSelectChat = () => {},
  onCreateNewChat = () => {},
}) => {
  return (
    // Use a slightly darker background, adjust padding, add border color
    <div className='w-64 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3 flex flex-col'>
      {/* Improved button styling */}
      <h1 className='mb-3 text-center font-bold text-2xl'>Ideasketch</h1>
      <button
        onClick={onCreateNewChat}
        className='mb-3 w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out'
      >
        + New Chat
      </button>

      {/* Adjusted heading style */}
      <h2 className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-1'>
        Chat History
      </h2>
      {/* Improved list styling */}
      <div className='flex-1 overflow-y-auto -mx-1'>
        {chatHistory.length === 0 ? (
          <p className='text-sm text-gray-500 dark:text-gray-400 px-1'>No chats yet.</p>
        ) : (
          <ul className='space-y-1'>
            {chatHistory.map((chat) => (
              <li
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                // Nicer hover effect, padding, text style
                className='px-3 py-1.5 rounded-md cursor-pointer text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 truncate'
                title={chat.title} // Add title attribute for long names
              >
                {chat.title}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Add settings/logout later */}
    </div>
  );
};

export default Sidebar;
