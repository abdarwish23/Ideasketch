import { NextResponse } from 'next/server';

// -----------------

// Define types for API request and response
interface UserSession {
  user_id: string;
  session_id: string;
}

interface APIRequest {
  user_session: UserSession;
  message: string;
}

interface APIResponse {
  // Add specific response properties based on your API
  // This is a placeholder - update with actual response structure
  data: unknown;
  success: boolean;
  error?: string;
}

// Configuration object for API settings
const API_CONFIG = {
  BASE_URL: 'https://mcp-patent-agent.onrender.com/api/query',
  TOKEN: process.env.API_TOKEN || 'your-secure-api-token-here',
};

/**
 * Makes an API call to the query endpoint
 * @param message - The message to send to the API
 * @param userId - The user's ID
 * @param sessionId - Optional session ID
 * @returns Promise containing the API response
 * @throws Error if the API request fails
 */
export const callAPI = async (message: string, userId: string, sessionId?: string): Promise<APIResponse> => {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_CONFIG.TOKEN}`,
    });

    const requestBody: APIRequest = {
      user_session: {
        user_id: `user-${userId}`,
        session_id: `session-${sessionId || ''}`,
      },
      message,
    };

    const response = await fetch(API_CONFIG.BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const result: APIResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
};

// Next.js API Route Handler (route.ts)
// -----------------

// Define request structure for type safety
interface RequestBody {
  message: string;
  userId: string;
  sessionId?: string;
}

/**
 * Handles POST requests to this API endpoint
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = (await request.json()) as RequestBody;
    const { message, userId, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing message parameter' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Call the external API
    const result = await callAPI(message, userId, sessionId);

    // Return the result as JSON
    return NextResponse.json(result);
  } catch (error) {
    // Properly type the error for better handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('Internal server error:', errorMessage);

    return NextResponse.json({ error: 'Internal Server Error', message: errorMessage }, { status: 500 });
  }
}
