'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import type { Message } from '@travel-planner/shared';

export interface ChatSocketCallbacks {
  onMessageReceive?: (message: Message) => void;
  onMessageDeleted?: (data: { messageId: string }) => void;
  onTypingStart?: (data: { userId: string; username: string }) => void;
  onTypingStop?: (data: { userId: string; username: string }) => void;
  onUserOnline?: (data: { userId: string; username: string }) => void;
  onUserOffline?: (data: { userId: string; username: string }) => void;
  onMessagesHistory?: (messages: Message[]) => void;
}

export function useChatSocket(roomId: string | null, callbacks: ChatSocketCallbacks = {}) {
  const { socket, isConnected } = useSocket();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    // Join the chat room
    socket.emit('room:join', { roomId });

    const handlers: Array<[string, (data: any) => void]> = [
      ['message:receive',  (data) => callbacksRef.current.onMessageReceive?.(data)],
      ['message:deleted',  (data) => callbacksRef.current.onMessageDeleted?.(data)],
      ['typing:start',     (data) => callbacksRef.current.onTypingStart?.(data)],
      ['typing:stop',      (data) => callbacksRef.current.onTypingStop?.(data)],
      ['user:online',      (data) => callbacksRef.current.onUserOnline?.(data)],
      ['user:offline',     (data) => callbacksRef.current.onUserOffline?.(data)],
      ['messages:history', (data) => callbacksRef.current.onMessagesHistory?.(data)],
    ];

    for (const [event, handler] of handlers) {
      socket.on(event, handler);
    }

    return () => {
      socket.emit('room:leave', { roomId });
      for (const [event, handler] of handlers) {
        socket.off(event, handler);
      }
    };
  }, [socket, isConnected, roomId]);

  const sendMessage = (content: string) => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit('message:send', { roomId, content });
  };

  const deleteMessage = (messageId: string) => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit('message:delete', { messageId, roomId });
  };

  const sendTypingStart = () => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit('typing:start', { roomId });
  };

  const sendTypingStop = () => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit('typing:stop', { roomId });
  };

  const getMessages = (limit?: number) => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit('messages:get', { roomId, limit });
  };

  return { sendMessage, deleteMessage, sendTypingStart, sendTypingStop, getMessages, isConnected };
}
