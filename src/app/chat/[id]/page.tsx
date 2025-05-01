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

  const {
    getChatMessages,
    addMessageToChat, // Assume this function now returns the ID of the added message: (chatId: string, message: ChatMessage) => string
    updateMessageContent, // <<< IMPORTANT: Assume you add this function to your context (chatId: string, messageId: string, newContent: string) => void
    selectChat,
    chats,
  } = useChatContext();

  const messageListRef = useRef<HTMLDivElement>(null);

  // Get messages for this specific chat
  const messages = getChatMessages(chatId);

  // Update current chat in context when this page loads
  useEffect(() => {
    selectChat(chatId);
  }, [chatId, selectChat]);

  // Get chat title for display
  const chatTitle = chats.find((chat) => chat.id === chatId)?.title || `Chat ${chatId}`;

  const processStream = async (response: Response, assistantMessageId: string) => {
    let fullAssistantResponse = ''; // Accumulate the full response text
    try {
      if (!response.ok) {
        // Attempt to read error details from the response body
        let errorBody = 'Could not read error body.';
        try {
          errorBody = await response.text();
        } catch {
          /* Ignore read error */
        }
        throw new Error(`API error! status: ${response.status} - ${response.statusText}. Body: ${errorBody}`);
      }

      // 4. Process the response stream
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          // console.log('Stream finished.');
          break; // Exit the loop when the stream is complete
        }

        buffer += value;
        // Process lines separated by newline. Gemini stream sends JSON chunks line by line.
        let boundary;
        while ((boundary = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, boundary).trim();
          buffer = buffer.substring(boundary + 1); // Keep the remainder

          if (line.length === 0) continue; // Skip empty lines

          // SSE data lines start with "data:". Extract the JSON.
          if (line.startsWith('data:')) {
            const jsonString = line.substring(5).trim(); // Remove "data:" and trim
            try {
              const parsed = JSON.parse(jsonString);
              const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;

              if (typeof textChunk === 'string') {
                fullAssistantResponse += textChunk;

                // 5. Update the UI incrementally using the context function
                //    *** Requires `updateMessageContent` to exist in your context ***
                console.log("updateMessageContent called", chatId, assistantMessageId, fullAssistantResponse);
                updateMessageContent(chatId, assistantMessageId, fullAssistantResponse);

                // Scroll as content arrives - optional, can be jerky
                messageListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }
              // Check for finish reason or other metadata if needed
              // const finishReason = parsed?.candidates?.[0]?.finishReason;
              // if (finishReason && finishReason !== "STOP") {
              //    console.warn("Generation finished with reason:", finishReason);
              // }
            } catch (parseError) {
              console.warn('Failed to parse JSON chunk:', line, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.log('Error processing stream:', error);
      throw error; // Re-throw to be caught by the outer try-catch
    }
  };

  const callGeminiAPI = async (newMessageContent: string, assistantMessageId: string) => {
    try {
      // 3. Use the streamGenerateContent endpoint
      console.log("newMessageContent before API call:", newMessageContent);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${process.env.GEMINI_API_KEY}&alt=sse`, {
        // Using 1.5 Flash, ensure your key has access
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Prepare context based on previous messages if needed
          contents: messages
            .filter((msg) => msg.content.trim() !== "") // Filter out empty messages
            .map((msg) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            }))
            .concat([
              {
                role: 'model',
                parts: [{ text: newMessageContent }],
              },
            ]),
        }),
      });

      await processStream(response, assistantMessageId);

    } catch (error) {
      console.log('Error calling Gemini API:', error);
      throw error;
    }
  };

  // Handler for sending messages - UPDATED FOR STREAMING
  const handleSendMessage = async (newMessageContent: string) => {
    if (!newMessageContent.trim()) {
      console.warn("Empty message content. Not sending to Gemini API.");
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key is not set in environment variables.');
      return;
    }

    
    // 1. Add user message to chat immediately
    addMessageToChat(chatId, {
      role: 'user',
      content: newMessageContent,
    });

    // 2. Add a placeholder for the assistant's message and get its ID
    //    *** Requires `addMessageToChat` to return the message ID ***
    //    *** Requires `updateMessageContent` function in your context ***
    const assistantMessageId: string = addMessageToChat(chatId, {
      role: 'assistant',
      content: '...', // Initial placeholder
    });

    // Ensure the placeholder is rendered before starting the stream potentially?
    // Might need a slight delay or state update confirmation if updates are too fast.
    await new Promise((resolve) => setTimeout(resolve, 0)); // Microtask delay

    try {
      await callGeminiAPI(newMessageContent, assistantMessageId);
    } catch (error) {
      console.log('Error calling Gemini API or processing stream:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Add a system error message to the chat
      addMessageToChat(chatId, {
        role: 'system',
        content: `Error generating response: ${errorMessage}`,
      });
      // Update the placeholder assistant message to show an error state
      // *** Requires `updateMessageContent` to exist in your context ***
      updateMessageContent(chatId, assistantMessageId, `Sorry, I encountered an error: ${errorMessage}`);
    } finally {
      // Final scroll after streaming is complete or on error
      scrollToChatEnd();
    }
  };

  const scrollToChatEnd = (timeOut = 100) => {
    if (!messageListRef.current) return;

    // Give React a moment to render the final update before scrolling
    setTimeout(() => {
      messageListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, timeOut);
  };

  return (
    <div className='flex flex-col h-full'>
      <h1 className='pl-4 lg:p-4 text-lg font-bold bg-white dark:bg-[#1B1C1D]'>{chatTitle}</h1>
      {/* Message List takes up remaining space */}
      <MessageList messages={messages} ref={messageListRef} />
      {/* Chat Input with handler connected */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
