'use client'; // Mark as client component for useState

import React, { useState } from 'react';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';

// Define message type matching MessageList
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Home() {
  // Placeholder state for messages - replace with actual logic later
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! How can I help you today?' },
    // Add more placeholder messages if needed
  ]);

  // Placeholder handler for sending messages
  const handleSendMessage = (newMessageContent: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Simple unique ID for now
      role: 'user',
      content: newMessageContent,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // TODO: Add logic to send message to backend and get streaming response
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Message List takes up remaining space */}
      <MessageList messages={messages} />
      {/* Chat Input at the bottom */}
      {/* Pass handleSendMessage to ChatInput later */}
      <ChatInput />
    </div>
  );
}
