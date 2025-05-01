'use client';

import React, { use, useEffect } from 'react';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatPageProps {
  params: React.Usable<{ id: string }>; // Next.js App Router passes params like this
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: chatId } = use(params);
  const { getChatMessages, addMessageToChat, selectChat, chats } = useChatContext();

  // Get messages for this specific chat
  const messages = getChatMessages(chatId);

  // Update current chat in context when this page loads
  useEffect(() => {
    selectChat(chatId);
  }, [chatId, selectChat]);

  // Get chat title for display
  const chatTitle = chats.find((chat) => chat.id === chatId)?.title || `Chat ${chatId}`;

  // Handler for sending messages
  const handleSendMessage = (newMessageContent: string) => {
    // Add user message to chat
    addMessageToChat(chatId, {
      role: 'user',
      content: newMessageContent,
    });

    // TODO: Add API call for AI response here
    // For now, just add a mock response after a short delay
    setTimeout(() => {
      addMessageToChat(chatId, {
        role: 'assistant',
        content: `You said: "${newMessageContent}". This is a placeholder response.`,
      });
    }, 1000);
  };

  return (
    <div className='flex flex-col h-full'>
      <h1 className='p-4 border-b text-lg font-semibold'>{chatTitle}</h1>
      {/* Message List takes up remaining space */}
      <MessageList messages={messages} />
      {/* Chat Input with handler connected */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
