'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/UseUser';

const NAME_QUERY = `What is my name? If it's found, return just the name. If not found, return null.`;

// Define types for our chat data
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  fullTitle: string;
  messages: Message[];
  createdAt: Date;
}

// Define the shape of our context
interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  userId: string;
  userName: string;
  createNewChat: (redirect?: boolean) => void;
  selectChat: (id: string) => void;
  addMessageToChat: (chatId: string, message: Omit<Message, 'id'>) => string;
  getChatMessages: (chatId: string) => Message[];
  updateMessageContent: (chatId: string, messageId: string, newContent: string) => void;
  deleteChatHistory: () => void;
  deleteChatById: (chatId: string) => void;
  saveUserIdToLocalStorage: () => string;
  loadUserIdToLocalStorage: () => string;
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
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { name: savedUsername, isLoading, error } = useUser(NAME_QUERY, userId);

  const loadUserIdToLocalStorage = useCallback((): string => {
    const loadUserId = localStorage.getItem('userId');
    if (!loadUserId) {
      return saveUserIdToLocalStorage();
    }
    return loadUserId;
  }, []);

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

  const saveUserNameToLocalStorage = useCallback(
    (username: string | null): string | null => {
      if (username && username !== 'null') {
        localStorage.setItem('username', username);
        setUserName(savedUsername || '');
      }
      return username;
    },
    [savedUsername],
  );

  const saveUserIdToLocalStorage = (): string => {
    const newId = typeof window !== 'undefined' ? window.crypto.randomUUID() : Date.now().toString();
    localStorage.setItem('userId', newId);
    return newId;
  };

  const saveChatsToLocalStorage = (chats: Chat[]) => {
    localStorage.setItem('chats', JSON.stringify(chats));
  };

  useEffect(() => {
    saveUserNameToLocalStorage(savedUsername);
  }, [savedUsername, isLoading, error, saveUserNameToLocalStorage]);

  // Initialize with demo chats or load from localStorage
  useEffect(() => {
    const storedChats = loadChatsFromLocalStorage();
    const userId = loadUserIdToLocalStorage();
    setChats(storedChats);
    setUserId(userId);
  }, [loadUserIdToLocalStorage]);

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
      title: `New Chat`,
      fullTitle: `New Chat`,
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

  const addMessageToChat = (chatId: string, messageData: Omit<Message, 'id'>) => {
    const message: Message = {
      ...messageData,
      id: typeof window !== 'undefined' ? window.crypto.randomUUID() : Date.now().toString(),
    };

    setChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat.id === chatId) {
          let nextTitle = chat.title; // Default to current title
          let nextFullTitle = chat.fullTitle; // Default to current full title

          // Check if titles need updating based on the FIRST user message
          if (chat.title.startsWith('New Chat') && messageData.role === 'user') {
            const content = messageData.content;
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

            // Calculate potentially truncated title
            const truncatedContent = content.length > 18 ? content.slice(0, 18) + '...' : content;
            nextTitle = capitalize(truncatedContent);

            // Calculate the actual full title from the content
            const truncatedFullContent = content.length > 40 ? content.slice(0, 40) + '...' : content;
            nextFullTitle = capitalize(truncatedFullContent);
          }

          // Construct the updated chat object
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, message],
            title: nextTitle, // Assign the determined display title
            fullTitle: nextFullTitle, // Assign the determined full title
          };
          console.log('updatedChat :>> ', updatedChat);
          return updatedChat;
        }
        return chat;
      });
    });
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
    userId,
    userName,
    createNewChat,
    selectChat,
    addMessageToChat,
    getChatMessages,
    updateMessageContent,
    deleteChatHistory,
    deleteChatById,
    saveUserIdToLocalStorage,
    loadUserIdToLocalStorage,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
