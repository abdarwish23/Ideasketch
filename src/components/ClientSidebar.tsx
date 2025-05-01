'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useChatContext } from '@/contexts/ChatContext';

const SIDEBAR_COLLAPSED_KEY = 'ideasketch-sidebar-collapsed';

// Add prop type for callback
interface ClientSidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ onCollapsedChange }) => {
  const { chats, createNewChat, selectChat, currentChatId } = useChatContext();
  
  // Initialize collapsed state from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Only run in the browser environment
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return savedState === 'true';
    }
    return false;
  });
  
  // Handle sidebar toggle
  const handleToggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    }
    // Notify parent component about the change
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  };
  
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
      currentChatId={currentChatId}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
    />
  );
}
export default ClientSidebar;

