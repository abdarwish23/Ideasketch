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
  addMessageToChat: (chatId: string, message: Omit<Message, 'id'>) => void;
  getChatMessages: (chatId: string) => Message[];
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

  // Initialize with demo chats or load from localStorage
  useEffect(() => {
    // Try to load chats from localStorage
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats) as Chat[];
        // Ensure dates are properly converted back to Date objects
        const chatsWithDates = parsedChats.map((chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }));
        setChats(chatsWithDates);
      } catch (error) {
        console.error('Failed to parse saved chats:', error);
        // Fall back to demo chats
        initializeDemoChats();
      }
    } else {
      // No saved chats, initialize with demo data
      initializeDemoChats();
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
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
    setCurrentChatId(id);
    alert(id)
    router.push(`/chat/${id}`);
  };

  // Add a message to a specific chat
  const addMessageToChat = (chatId: string, messageData: Omit<Message, 'id'>) => {
    const message: Message = {
      ...messageData,
      id: Date.now().toString(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              // Update title to first user message if it's a new chat with default title
              title:
                chat.title.startsWith('New Chat') && chat.messages.length === 1 && messageData.role === 'user'
                  ? messageData.content.slice(0, 30) + (messageData.content.length > 30 ? '...' : '')
                  : chat.title,
            }
          : chat,
      ),
    );
  };

  // Get messages for a specific chat
  const getChatMessages = (chatId: string): Message[] => {
    const chat = chats.find((c) => c.id === chatId);
    return chat ? chat.messages : [];
  };
  // Extract current chat ID from pathname if in a chat route
  useEffect(() => {
    // Add log to debug the pathname
    console.log(`Current pathname: ${pathname}`);
    
    if (pathname?.startsWith('/chat/')) {
      const id = pathname.split('/')[2];
      console.log(`Extracted chat ID from URL: ${id}`);
      
      if (id) {
        setCurrentChatId(id);
        console.log(`Updated currentChatId from URL to: ${id}`);
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
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
