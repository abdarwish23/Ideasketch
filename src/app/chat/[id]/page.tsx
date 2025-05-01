'use client';

import React, { use, useEffect, useRef } from 'react';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatPageProps {
  params: React.Usable<{ id: string }>; // Next.js App Router passes params like this
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: chatId } = use(params);
  const { getChatMessages, addMessageToChat, selectChat, chats } = useChatContext();
  const messageListRef = useRef<HTMLDivElement>(null);

  // Get messages for this specific chat
  const messages = getChatMessages(chatId);

  // Update current chat in context when this page loads
  useEffect(() => {
    selectChat(chatId);
  }, [chatId, selectChat]);

  // Get chat title for display
  const chatTitle = chats.find((chat) => chat.id === chatId)?.title || `Chat ${chatId}`;

  // Handler for sending messages
  const handleSendMessage = async (newMessageContent: string) => {
    // Add user message to chat
    addMessageToChat(chatId, {
      role: 'user',
      content: newMessageContent,
    });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: newMessageContent }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      addMessageToChat(chatId, {
        role: 'assistant',
        content: aiResponse,
      });
      messageListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Handle error appropriately, e.g., display an error message in the UI
      if (error instanceof Error) {
        addMessageToChat(chatId, {
          role: 'system',
          content: `Error generating response: ${error.message}`,
        });
      } else {
        addMessageToChat(chatId, {
          role: 'system',
          content: `Error generating response: An unknown error occurred.`,
        });
      }
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <h1 className='p-4 border-b text-lg font-semibold'>{chatTitle}</h1>
      {/* Message List takes up remaining space */}
      <MessageList messages={messages} ref={messageListRef} />
      {/* Chat Input with handler connected */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
