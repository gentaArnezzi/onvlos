import { Server as SocketIOServer } from "socket.io";
import { logger } from "./logger";

/**
 * Get the Socket.io server instance from global (set by server.js)
 * This is a singleton pattern to ensure reliable access to the socket server
 */
export function getIO(): SocketIOServer | null {
  // Try to get from global (set by server.js)
  if (typeof global !== 'undefined' && (global as any).io) {
    return (global as any).io as SocketIOServer;
  }
  
  // Fallback: try to get from Node.js global
  if (typeof globalThis !== 'undefined' && (globalThis as any).io) {
    return (globalThis as any).io as SocketIOServer;
  }
  
  logger.warn("Socket.io server not found in global. Make sure server.js is running.");
  return null;
}

/**
 * Check if socket server is available
 */
export function isSocketServerAvailable(): boolean {
  return getIO() !== null;
}
