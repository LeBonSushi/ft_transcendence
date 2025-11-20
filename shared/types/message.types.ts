// Shared Message Types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  createdAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}
