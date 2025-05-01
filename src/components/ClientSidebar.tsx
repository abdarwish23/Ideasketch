'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useChatContext } from '@/contexts/ChatContext';

const ClientSidebar: React.FC = () => {
  const { chats, createNewChat, selectChat } = useChatContext();
  
  // Convert chats to the format expected by Sidebar
  const chatHistory = chats.map(chat => ({
    id: chat.id,
    title: chat.title
  }));

  return (
    <Sidebar 
      chatHistory={chatHistory}
      onSelectChat={selectChat}
      onCreateNewChat={createNewChat}
    />
  );
};

export default ClientSidebar;

