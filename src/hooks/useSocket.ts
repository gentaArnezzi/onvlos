import { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;
let socketUsers = 0;
let globalConnectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error' = 'disconnected';
let globalIsConnected = false;
const stateListeners = new Set<(state: typeof globalConnectionState, isConnected: boolean) => void>();

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

function notifyStateListeners(state: typeof globalConnectionState, isConnected: boolean) {
  globalConnectionState = state;
  globalIsConnected = isConnected;
  stateListeners.forEach(listener => listener(state, isConnected));
}

export function useSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(globalConnectionState);
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  // State listener callback
  const stateListener = useCallback((state: ConnectionState, connected: boolean) => {
    setConnectionState(state);
    setIsConnected(connected);
  }, []);

  useEffect(() => {
    // Create socket if it doesn't exist
    if (!socketInstance) {
      const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      console.log('Creating new socket connection to:', socketUrl);
      notifyStateListeners('connecting', false);
      
      socketInstance = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000, // Initial delay
        reconnectionDelayMax: 30000, // Max delay (30 seconds)
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
        // Exponential backoff is handled by socket.io automatically
        // It uses: min(reconnectionDelay * 2^attempt, reconnectionDelayMax)
      });

      socketInstance.on('connect', () => {
        console.log('✅ Connected to socket server, socket ID:', socketInstance?.id);
        notifyStateListeners('connected', true);
        reconnectAttemptsRef.current = 0; // Reset on successful connection
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        
        // If disconnect was not intentional, mark as reconnecting
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          // Intentional disconnect
          notifyStateListeners('disconnected', false);
        } else {
          // Network error or transport close - will attempt reconnection
          notifyStateListeners('reconnecting', false);
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message || error);
        console.error('Error details:', {
          type: error.type,
          description: error.description,
          context: error.context
        });
        reconnectAttemptsRef.current++;
        
        // If max attempts reached, stop trying
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          notifyStateListeners('error', false);
          console.error('Max reconnection attempts reached');
        } else {
          notifyStateListeners('reconnecting', false);
        }
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to socket server after', attemptNumber, 'attempts');
        notifyStateListeners('connected', true);
        reconnectAttemptsRef.current = 0;
      });

      socketInstance.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt', attemptNumber);
        notifyStateListeners('reconnecting', false);
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
        reconnectAttemptsRef.current++;
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          notifyStateListeners('error', false);
        } else {
          notifyStateListeners('reconnecting', false);
        }
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Reconnection failed after max attempts');
        notifyStateListeners('error', false);
      });

      // Set initial state based on current socket status
      if (socketInstance.connected) {
        notifyStateListeners('connected', true);
      } else {
        // Socket is connecting, wait a bit to see if it connects
        notifyStateListeners('connecting', false);
        // Check again after a short delay
        setTimeout(() => {
          if (socketInstance && socketInstance.connected) {
            notifyStateListeners('connected', true);
          } else if (socketInstance && !socketInstance.connected) {
            // Still not connected, might be an error
            notifyStateListeners('disconnected', false);
          }
        }, 1000);
      }
    } else {
      // Socket instance already exists, check its current status
      if (socketInstance.connected) {
        notifyStateListeners('connected', true);
      } else {
        // Socket exists but not connected - might be reconnecting
        notifyStateListeners(globalConnectionState, globalIsConnected);
      }
    }

    socketUsers++;
    socketRef.current = socketInstance;

    // Register state listener
    stateListeners.add(stateListener);

    // Update with current global state
    setConnectionState(globalConnectionState);
    setIsConnected(globalIsConnected);

    return () => {
      socketUsers--;
      stateListeners.delete(stateListener);
      
      // Only disconnect socket if no users are using it
      if (socketUsers === 0 && socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
        reconnectAttemptsRef.current = 0;
        notifyStateListeners('disconnected', false);
      } else {
        socketRef.current = null;
      }
    };
  }, [stateListener]);

  return { 
    socket: socketRef.current, 
    isConnected,
    connectionState 
  };
}
