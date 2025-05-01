'use client';

import React, { useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { chats, createNewChat } = useChatContext();
  const router = useRouter();

  useEffect(() => {
    // If there are existing chats, redirect to the most recent one
    if (chats.length > 0) {
      const mostRecentChat = chats[0]; // Chats are sorted by creation date
      router.push(`/chat/${mostRecentChat.id}`);
    } else {
      // If no chats, create a new one (will auto-redirect)
      createNewChat();
    }
  }, [chats, createNewChat, router]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">IdeaSketch</h1>
        <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
          Your AI brainstorming assistant
        </p>
        <div className="animate-pulse">
          <p className="text-gray-500 dark:text-gray-400">
            Loading your chat experience...
          </p>
        </div>
      </div>
    </div>
  );
}
