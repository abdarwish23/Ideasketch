import { NextResponse } from 'next/server';

const callAPI = async (newMessageContent: string, assistantMessageId: string) => {
  try {
    console.log('newMessageContent before API call:', newMessageContent);

    // Stream the response from the external API
    const response = await fetch(`https://mcp-patent-agent.onrender.com/api/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer your-secure-api-token-here',
      },
      body: JSON.stringify({
        user_session: {
          user_id: `user-${assistantMessageId}`,
          session_id: `session-${assistantMessageId}`,
        },
        message: newMessageContent, // Use the actual newMessageContent for the message
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stream from external API');
    }

    return response.body; // Return the readable stream body directly
  } catch (error) {
    console.log('Error calling API:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const { newMessageContent, assistantMessageId } = await request.json();
    if (!newMessageContent || !assistantMessageId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Call the external API and get the stream
    const stream = await callAPI(newMessageContent, assistantMessageId);

    // Create a new Response to stream the data back to the client
    const readableStream = new ReadableStream({
      start(controller) {
        // This is where we pipe the external API stream data
        const reader = stream?.getReader();

        // Read chunks of data from the external stream and push them to the new stream
        const pushData = () => {
          reader
            ?.read()
            .then(({ done, value }) => {
              if (done) {
                controller.close(); // Close the stream when done
                return;
              }

              controller.enqueue(value); // Enqueue the chunk to be sent to the client
              pushData(); // Continue reading next chunk
            })
            .catch((err) => {
              console.error('Stream error:', err);
              controller.error(err); // Propagate error to client if stream fails
            });
        };

        pushData();
      },
    });

    // Return the streamed response to the client
    return new NextResponse(readableStream, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
