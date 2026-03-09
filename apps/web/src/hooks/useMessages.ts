'use client';

import { useState } from 'react';
import { useChatSocket } from './useChatSocket';
import type { Message } from '@travel-planner/shared';

export function useMessages(roomId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(!!roomId);

  const { sendMessage, deleteMessage, sendTypingStart, sendTypingStop, getMessages, isConnected } = useChatSocket(roomId, {
    onMessageReceive: (message) => {
      setMessages(prev => [...prev, message]);
      console.log("Message received:", message)
    },
    onMessageDeleted: () => {},
    onMessagesHistory: (history) => {
      setLoading(false);
      setMessages(history);
    },
  });

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
