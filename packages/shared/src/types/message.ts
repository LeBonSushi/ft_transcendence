export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachmentUrl?: string;
  createdAt: Date;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  username: string;
}

export interface RoomPresence {
  roomId: string;
  userId: string;
  username: string;
  joinedAt: Date;
}
