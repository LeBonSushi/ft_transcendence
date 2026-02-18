'use client';

import { createContext, useState, useEffect, useRef} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/stores/useUserStore";

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
  const { user } = useUserStore();
  const isSignedIn = status === "authenticated" && user !== null;
  const token = session?.socketToken ?? null;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user || !token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

    const newSocket = io(wsUrl, {
      auth: { token }, // Use JWT token from session
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

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, [isSignedIn, user, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      { children }
    </SocketContext.Provider>
  )
}
