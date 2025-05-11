import { NextResponse } from 'next/server';

const callAPI = async (newMessageContent: string, userId: string, sessionId: string) => {
  try {
    console.log('newMessageContent :>>', newMessageContent);
    console.log('userId :>> ', userId);
    console.log('sessionId :>> ', sessionId);
    // throw new Error(`newMessageContent: ${newMessageContent} - userId:${userId} - sessionId:${sessionId}`);

    // Stream the response from the external API
    const BASE_URL = 'https://flowise-13k6.onrender.com/api/v1/prediction/8ada17bf-c96e-43be-9b16-ec6d2dd1f7f4';

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      
        Authorization: `Bearer WKW_w9FCB8U7dFkGOzWk7m2VbhU_dIO8JJwdIoyCcmE`,
      },
      body: JSON.stringify({
        // user_session: {
        //   user_id: `user-${userId}`,
        //   session_id: `session-${sessionId}`,
        // },
        // message: newMessageContent, // Use the actual newMessageContent for the message

        question: newMessageContent,
        streaming: true,
        overrideConfig: {
          sessionId: `session-${sessionId}`,
          enableDetailedStreaming: true,
        },
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
    const { newMessageContent, userId, sessionId } = await request.json();
    if (!newMessageContent || !userId || !sessionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Call the external API and get the stream
    const stream = await callAPI(newMessageContent, userId, sessionId);

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
  } catch (error: unknown) {
    console.error('Internal error:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: `Internal Server Error`, message: String((error as any).message) }, { status: 500 });
  }
}
