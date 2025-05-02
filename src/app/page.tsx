'use client';

import React, { useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { chats, createNewChat } = useChatContext();
  const router = useRouter();

  useEffect(() => {
    if (chats.length === 0) {
      createNewChat(false);
    }
  }, [chats, createNewChat]);

  const handleGoToMostRecentChat = () => {
    if (chats.length > 0) {
      const mostRecentChat = chats[0]; // Chats are sorted by creation date
      router.push(`/chat/${mostRecentChat.id}`);
    } else {
      createNewChat();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-full bg-gradient-radial from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-fadeIn'>
      <div className='text-center max-w-md'>
        <h1 className='font-bold mb-4 text-blue-600 text-7xl'>IdeaSketch</h1>
        <p className='text-xl mb-6 text-gray-700 dark:text-gray-300'>Your AI assistant.</p>
        {chats.length > 0 ? (
          <button
            onClick={handleGoToMostRecentChat}
            className='px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out shadow-md animate-pulse cursor-pointer'
          >
            Go to Most Recent Chat
          </button>
        ) : (
          <div className='animate-pulse flex items-center justify-center'>
            <p className='text-gray-500 dark:text-gray-400'>Loading your chat experience...</p>
          </div>
        )}
      </div>
    </div>
  );
}
