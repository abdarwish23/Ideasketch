'use client';
import { useEffect, useState } from 'react';

// const callQueryApi = async (message: string, userId: string, sessionId: string) => {
//   return await fetch(`/api/chat/query`, {
//     method: 'POST',
//     body: JSON.stringify({
//       message,
//       userId,
//       sessionId,
//     }),
//   });
// };

const useUser = (message: string, userId: string, sessionId?: string) => {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip the API call if userId is empty
    const fetchUserName = async () => {
      try {
        setIsLoading(true);
        if (!userId) {
          setIsLoading(false);
          return;
        }

        const getUserNameFromStorage = localStorage.getItem('username');

        if (getUserNameFromStorage) {
          setIsLoading(false);
          setName(getUserNameFromStorage);
          return;
        }

        // const res = await callQueryApi(message, userId, sessionId || '');

        // if (!res.ok) {
        //   throw new Error(`API request failed with status ${res.status}`);
        // }

        try {
          // const json = await res.json();
          // const queryName = json.message;
          // console.log('queryName :>> ', queryName);
          // setName();
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching user name:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserName();
  }, [userId, sessionId, message]);

  return { name, isLoading, error };
};

export { useUser };
