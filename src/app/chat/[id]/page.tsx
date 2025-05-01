'use client'; // Mark as client component for useState and potential data fetching hooks

import React, { useState, useEffect } from 'react';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';

// Define message type matching MessageList
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatPageProps {
  params: { id: string }; // Next.js App Router passes params like this
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: chatId } = params;

  // Placeholder state for messages - replace with actual data fetching later
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // TODO: Fetch messages for the specific chatId from the database/API
    console.log(`Fetching messages for chat ID: ${chatId}`);
    // Simulate fetching initial messages for this specific chat
    setMessages([
      { id: 'chat1-1', role: 'assistant', content: `Welcome to chat ${chatId}.` },
      // Add more placeholder messages if needed
    ]);
  }, [chatId]); // Re-fetch if chatId changes

  // Placeholder handler for sending messages
  const handleSendMessage = (newMessageContent: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Simple unique ID for now
      role: 'user',
      content: newMessageContent,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // TODO: Add logic to send message to backend (associated with chatId) and get streaming response
    console.log(`Sending message in chat ${chatId}: ${newMessageContent}`);
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="p-4 border-b text-lg font-semibold">Chat Thread: {chatId}</h1>
      {/* Message List takes up remaining space */}
      <MessageList messages={messages} />
      {/* Chat Input at the bottom */}
      {/* Pass handleSendMessage to ChatInput later */}
      <ChatInput />
    </div>
  );
}
