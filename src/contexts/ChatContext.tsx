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
  createNewChat: (redirect?: boolean) => void;
  selectChat: (id: string) => void;
  addMessageToChat: (chatId: string, message: Omit<Message, 'id'>) => string;
  getChatMessages: (chatId: string) => Message[];
  updateMessageContent: (chatId: string, messageId: string, newContent: string) => void;
  deleteChatHistory: () => void;
  deleteChatById: (chatId: string) => void;
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
    setChats(storedChats);
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToLocalStorage(chats);
    }
  }, [chats]);

  // Create a new chat
  const createNewChat = (redirect = true) => {
    // const newChatId = Date.now().toString();
    const newChatId = typeof window !== 'undefined' ? window.crypto.randomUUID() : Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: `New Chat ${chats.length == 0 ? 1 : chats.length}`,
      messages: [],
      createdAt: new Date(),
    };
    setCurrentChatId(newChatId);
    setChats((prevChats) => [newChat, ...prevChats]);

    if (redirect) {
      setTimeout(() => {
        selectChat(newChatId);
      }, 300);
    }
  };

  // Select an existing chat
  const selectChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const updateChatTitle = (chat: Chat, messageData: Omit<Message, 'id'>): string => {
    if (chat.title.startsWith('New Chat') && messageData.role === 'user') {
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
      }),
    );
    return message.id;
  };

  const updateMessageContent = (chatId: string, messageId: string, newContent: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)),
          };
        }
        return chat;
      }),
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

  const deleteChatHistory = () => {
    setChats([]);
    localStorage.removeItem('chats');
    setCurrentChatId(null);
  };

  const deleteChatById = (chatId: string) => {
    setChats((prevChats) => {
      const filteredChats = prevChats.filter((chat) => chat.id !== chatId);
      saveChatsToLocalStorage(filteredChats);
      return filteredChats;
    });
    setCurrentChatId(null);
  };
  const contextValue: ChatContextType = {
    chats,
    currentChatId,
    createNewChat,
    selectChat,
    addMessageToChat,
    getChatMessages,
    updateMessageContent,
    deleteChatHistory,
    deleteChatById,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
