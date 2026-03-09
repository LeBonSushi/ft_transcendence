export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export interface Message {
  roomId: string;
  content: string;
  type: MessageType;
  attachmentUrl: string | null;
  createdAt: string;
  sender: {
    username: string;
    profile: {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      profilePicture: string | null;
    } | null;
  };
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
