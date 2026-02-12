'use client';

import { createContext, useState, useEffect, useRef} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isSignedIn)
      return;

    const initSocket = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        if (!apiUrl) {
          console.error('NEXT_PUBLIC_API_URL is not defined');
          return;
        }

        const token = session?.accessToken || '';
        const newSocket = io(apiUrl, {
          auth: { token },
        });

        const onConnect = () => {
          console.log("Socket Connected.");
          setIsConnected(true);
        };

        const onDisconnect = () => {
          console.log("Socket Disconnected");
          setIsConnected(false);
        };

        newSocket.on('connect', onConnect);
        newSocket.on('disconnect', onDisconnect);

        socketRef.current = newSocket;
        setSocket(newSocket);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.disconnect();
      }
    }
  }, [isSignedIn]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      { children }
    </SocketContext.Provider>
  )
}
