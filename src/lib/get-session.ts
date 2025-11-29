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

      // Re-throw other errors
      throw error;
    }
  }
  return null;
}

export async function getSession() {
  return retryWithBackoff(async () => {
    const session = await auth.api.getSession({
      headers: await headers(), // Next.js 15 requirement
    });
    return session;
  });
}
