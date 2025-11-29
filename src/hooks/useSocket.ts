import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        withCredentials: true
      });

      socket.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return { socket, isConnected };
}
