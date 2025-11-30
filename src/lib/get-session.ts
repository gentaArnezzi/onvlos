import { auth } from "./auth";
import { headers } from "next/headers";

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 100
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isConnectionError = 
        error?.cause?.code === '53300' || 
        error?.message?.includes('too many clients') ||
        error?.body?.cause?.code === '53300' ||
        (error?.status === 'INTERNAL_SERVER_ERROR' && error?.body?.cause?.code === '53300');

      // Check if it's a query error (likely from Drizzle ORM internal logging)
      const isQueryError = 
        error?.message?.includes('Failed query') ||
        error?.message?.includes('select') ||
        error?.message?.includes('session');

      if (isConnectionError && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Connection pool exhausted, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it's a connection error on last retry, return null gracefully
      if (isConnectionError) {
        console.error('Database connection pool exhausted after retries. Please wait a moment and try again.');
        return null;
      }

      // For query errors (likely session not found or invalid token), return null silently
      // This is expected behavior when session is invalid or expired
      if (isQueryError) {
        return null;
      }

      // Re-throw other errors
      throw error;
    }
  }
  return null;
}

export async function getSession() {
  try {
    return await retryWithBackoff(async () => {
      const session = await auth.api.getSession({
        headers: await headers(), // Next.js 15 requirement
      });
      return session;
    });
  } catch (error: any) {
    // Silently handle session errors - invalid tokens, expired sessions, etc.
    // This is expected behavior and the app will redirect to login
    const isSessionError = 
      error?.message?.includes('Failed query') ||
      error?.message?.includes('session') ||
      error?.message?.includes('token');
    
    if (isSessionError) {
      return null;
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}
