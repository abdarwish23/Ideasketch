import { type NextRequest } from 'next/server';
import { getOpenAIStream } from '@/lib/openai'; // Assuming this function handles the streaming logic

// Example using Edge Runtime for potential performance benefits with streaming
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, apiKey, model } = body; // Extract messages and optional params

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid request body: messages are required.', { status: 400 });
    }

    // TODO: Add validation for message structure if needed

    // Get the stream from the OpenAI library function
    const stream = await getOpenAIStream(messages, apiKey, model);

    // Return the stream directly to the client
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream', // Or appropriate content type for your stream format
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat stream API:', error);
    // Determine appropriate error response based on the error type
    if (error instanceof SyntaxError) { // JSON parsing error
        return new Response('Invalid JSON in request body.', { status: 400 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
