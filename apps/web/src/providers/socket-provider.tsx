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
    if (!isSignedIn || !session?.socketToken)
      return;

    const initSocket = async () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
        if (!wsUrl) {
          console.error('NEXT_PUBLIC_WS_URL is not defined');
          return;
        }

        const newSocket = io(wsUrl, {
          auth: { token: session.socketToken },
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
  }, [isSignedIn, session?.socketToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      { children }
    </SocketContext.Provider>
  )
}
