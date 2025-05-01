'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define types for our chat data
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

// Define the shape of our context
interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  createNewChat: () => void;
  selectChat: (id: string) => void;
  addMessageToChat: (chatId: string, message: Omit<Message, 'id'>) => string;
  getChatMessages: (chatId: string) => Message[];
  updateMessageContent: (chatId: string, messageId: string, newContent: string) => void;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Custom hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// The provider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const loadChatsFromLocalStorage = (): Chat[] => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats) as Chat[];
        return parsedChats.map((chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }));
      } catch (error) {
        console.error('Failed to parse saved chats:', error);
        return [];
      }
    }
    return [];
  };

  const saveChatsToLocalStorage = (chats: Chat[]) => {
    localStorage.setItem('chats', JSON.stringify(chats));
  };

  // Initialize with demo chats or load from localStorage
  useEffect(() => {
    const storedChats = loadChatsFromLocalStorage();
    if (storedChats.length > 0) {
      setChats(storedChats);
    } else {
      initializeDemoChats();
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToLocalStorage(chats);
    }
  }, [chats]);

  // Initialize with demo chats
  function initializeDemoChats() {
    const initialChats: Chat[] = [
      {
        id: '1',
        title: 'Welcome Chat',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Welcome to IdeaSketch! How can I help you today?',
          },
        ],
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Project Ideas',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: "Let's brainstorm some project ideas!",
          },
        ],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];
    setChats(initialChats);
  }

  // Create a new chat
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: `New Chat ${chats.length + 1}`,
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'How can I help you today?',
        },
      ],
      createdAt: new Date(),
    };

    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChatId);
    router.push(`/chat/${newChatId}`);
  };

  // Select an existing chat
  const selectChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const updateChatTitle = (chat: Chat, messageData: Omit<Message, 'id'>): string => {
    if (chat.title.startsWith('New Chat') && chat.messages.length === 1 && messageData.role === 'user') {
      return messageData.content.slice(0, 30) + (messageData.content.length > 30 ? '...' : '');
    }
    return chat.title;
  };

  // Add a message to a specific chat
  const addMessageToChat = (chatId: string, messageData: Omit<Message, 'id'>) => {
    const message: Message = {
      ...messageData,
      id: typeof window !== 'undefined' ? window.crypto.randomUUID() : Date.now().toString(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, message],
            title: updateChatTitle(chat, messageData),
          };
          return updatedChat;
        }
        return chat;
      })
    );
    return message.id;
  };

  const updateMessageContent = (chatId: string, messageId: string, newContent: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === messageId ? { ...msg, content: newContent } : msg
            ),
          };
        }
        return chat;
      })
    );
  };

  // Get messages for a specific chat
  const getChatMessages = (chatId: string): Message[] => {
    const chat = chats.find((c) => c.id === chatId);
    return chat ? chat.messages : [];
  };
  // Extract current chat ID from pathname if in a chat route
  useEffect(() => {
    if (pathname?.startsWith('/chat/')) {
      const id = pathname.split('/')[2];

      if (id) {
        setCurrentChatId(id);
      }
    }
  }, [pathname]);

  const contextValue: ChatContextType = {
    chats,
    currentChatId,
    createNewChat,
    selectChat,
    addMessageToChat,
    getChatMessages,
    updateMessageContent,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
