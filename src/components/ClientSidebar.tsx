'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './Sidebar';
import { useChatContext } from '@/contexts/ChatContext';

/**
 * Key used for storing sidebar collapsed state in localStorage
 */
const SIDEBAR_COLLAPSED_KEY = 'ideasketch-sidebar-collapsed';

/**
 * Props interface for the ClientSidebar component
 */
interface ClientSidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
  initialCollapsed?: boolean;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ onCollapsedChange, initialCollapsed = false }) => {
  const { chats, createNewChat, selectChat, currentChatId } = useChatContext();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      setIsCollapsed(false); // Force sidebar to be expanded on mobile
    } else if (initialCollapsed === false) {
      try {
        const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
        setIsCollapsed(savedState === 'true');
      } catch (error) {
        console.warn('Error reading sidebar state from localStorage:', error);
        setIsCollapsed(false);
      }
    }

    setIsHydrated(true);
  }, [initialCollapsed]);

  useEffect(() => {
    if (!isHydrated) return;
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, isHydrated, onCollapsedChange]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      const isMobile = window.matchMedia('(max-width: 1000px)').matches;
      if (isMobile) {
        setIsCollapsed(false);
      }
      if (!isMobile) {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
      }
    } catch (error) {
      console.warn('Error saving sidebar state to localStorage:', error);
    }
  }, [isCollapsed, isHydrated]);

  const handleToggleCollapse = useCallback((collapsed: boolean) => {
    const isMobile = window.matchMedia('(max-width: 1000px)').matches;
    if (isMobile) {
      setIsCollapsed(false);
    }
    if (!isMobile) {
      setIsCollapsed(collapsed);
    }
  }, []);

  const chatHistory = useMemo(
    () =>
      chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
      })),
    [chats],
  );

  return (
    <span className={`sidebar-wrapper ${isHydrated ? 'hydrated' : ''}`}>
      <Sidebar
        chatHistory={chatHistory}
        onSelectChat={selectChat}
        onCreateNewChat={createNewChat}
        currentChatId={currentChatId}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
    </span>
  );
};

export default ClientSidebar;
