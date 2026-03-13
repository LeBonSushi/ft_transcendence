'use client';

import { useState, useEffect } from 'react';
import { useChatSocket } from './useChatSocket';
import type { Message } from '@travel-planner/shared';

export function useMessages(roomId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(!!roomId);

  // Clear messages when switching rooms so stale content never lingers
  useEffect(() => {
    setMessages([]);
    setLoading(!!roomId);
  }, [roomId]);

  const { sendMessage: _sendMessage, deleteMessage, sendTypingStart, sendTypingStop, getMessages, isConnected } = useChatSocket(roomId, {
    onMessageReceive: (message) => {
      setMessages(prev => [...prev, message]);
    },
    onMessageDeleted: () => {},
    onMessagesHistory: (history) => {
      setLoading(false);
      setMessages(history);
    },
  });

  const sendMessage = (content: string, options?: { type?: 'TEXT' | 'IMAGE' | 'SYSTEM'; attachmentUrl?: string }) => {
    _sendMessage(content, options);
  };

  return {
    messages,
    loading,
    sendMessage,
    getMessages,
    deleteMessage,
    sendTypingStart,
    sendTypingStop,
    isConnected,
  };
}
