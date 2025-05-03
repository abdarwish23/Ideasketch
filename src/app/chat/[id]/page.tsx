'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { useChatContext } from '@/contexts/ChatContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ChatPage({ params }: { params: any }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrappedParams = use(params) as any;
  const { id: chatId } = unwrappedParams;

  const {
    getChatMessages,
    addMessageToChat, // Assume this function now returns the ID of the added message: (chatId: string, message: ChatMessage) => string
    updateMessageContent, // <<< IMPORTANT: Assume you add this function to your context (chatId: string, messageId: string, newContent: string) => void
    selectChat,
    chats,
    createNewChat,
  } = useChatContext();

  const messageListRef = useRef<HTMLDivElement>(null);

  // Get messages for this specific chat
  const messages = getChatMessages(chatId);

  // Update current chat in context when this page loads
  useEffect(() => {
    selectChat(chatId);
    if (!chats) {
      createNewChat();
    }
  }, [chatId, chats, createNewChat, selectChat]);

  // Get chat title for display
  const chatTitle = chats.find((chat) => chat.id === chatId)?.title || `New Chat`;
  const [isGenerating, setIsGenerating] = useState(false);
  const [stopGeneration, setStopGeneration] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processStream = async (response: Response, assistantMessageId: string) => {
    if (stopGeneration) {
      console.log('Stop generation detected at start of processStream!');
      return;
    }

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

        if (stopGeneration) {
          console.log('Stop generation detected after reader.read()!');
          setStopGeneration(false); // Reset the state
          console.log('stopGeneration state reset');
          break; // Exit the loop if stopGeneration is true
        }

        if (done) {
          // console.log('Stream finished.');
          break; // Exit the loop when the stream is complete
        }

        buffer += value;
        // Process lines separated by newline.  stream sends JSON chunks line by line.
        let boundary;
        while ((boundary = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, boundary).trim();
          buffer = buffer.substring(boundary + 1); // Keep the remainder
          buffer = ''; // Clear the buffer
          if (line.length === 0) continue; // Skip empty lines

          // SSE data lines start with "data:". Extract the JSON.
          if (line.startsWith('data:')) {
            const jsonString = line.substring(5).trim(); // Remove "data:" and trim
            try {
              // Attempt to parse the JSON string
              const parsed = JSON.parse(jsonString);
              const textChunk = parsed.content;

              if (typeof textChunk === 'string' && !stopGeneration && !abortControllerRef.current?.signal.aborted) {
                fullAssistantResponse += textChunk;

                // 5. Update the UI incrementally using the context function
                //    *** Requires `updateMessageContent` to exist in your context ***
                console.log('updateMessageContent called', chatId, assistantMessageId, fullAssistantResponse);
                updateMessageContent(chatId, assistantMessageId, fullAssistantResponse);

                // Scroll as content arrives - optional, can be jerky
                messageListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
              }
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

  const callAPI = async (newMessageContent: string, assistantMessageId: string) => {
    try {
      const response = await fetch(`/api/chat/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer your-secure-api-token-here',
        },
        body: JSON.stringify({
          newMessageContent,
          assistantMessageId,
          signal: abortControllerRef.current?.signal,
        }),
      });

      await processStream(response, assistantMessageId);
    } catch (error) {
      console.log('Error calling API:', error);
      throw error;
    }
  };

  // Handler for sending messages - UPDATED FOR STREAMING
  const handleSendMessage = async (newMessageContent: string) => {
    setStopGeneration(false); // Reset stop state for each new message
    if (!newMessageContent.trim()) {
      console.warn('Empty message content. Not sending to  API.');
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
    console.log('setIsGenerating(true) called');
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    try {
      await callAPI(newMessageContent, assistantMessageId);
    } catch (error) {
      console.log('Error calling  API or processing stream:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Add a system error message to the chat
      if (!errorMessage.includes('BodyStreamBuffer was aborted')) {
        addMessageToChat(chatId, {
          role: 'system',
          content: `Error generating response: ${errorMessage}`,
        });
      }
      // Update the placeholder assistant message to show an error state
      // *** Requires `updateMessageContent` to exist in your context ***
    } finally {
      // Final scroll after streaming is complete or on error
      scrollToChatEnd();
      setIsGenerating(false);
      setStopGeneration(false);
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
    <div className='flex flex-col h-full bg-white dark:bg-[#1B1C1D] '>
      <div className='flex items-center justify-between border-b  border-stone-200 dark:border-stone-800  border-solid'>
        <h1 className='pl-4 lg:p-4 text-lg font-bold'>{chatTitle}</h1>
      </div>
      {/* Message List takes up remaining space */}
      <MessageList messages={messages} ref={messageListRef} />
      {/* Chat Input with handler connected */}
      <ChatInput onSendMessage={handleSendMessage} isGenerating={isGenerating} setStopGeneration={setStopGeneration} abortControllerRef={abortControllerRef} />
    </div>
  );
}
