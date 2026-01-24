'use client';

import { createContext, useState, useEffect, useRef} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs"; // Hypothetical authentication hook

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isSignedIn)
      return;

    const initSocket = async () => {
      const token = await getToken();
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log("Socket Connected.");
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log("Socket Disconnected");
        setIsConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

    };

    initSocket();
    
    return () => {
      socketRef.current?.disconnect();
    }
  }, [isSignedIn]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      { children }
    </SocketContext.Provider>
  )
}