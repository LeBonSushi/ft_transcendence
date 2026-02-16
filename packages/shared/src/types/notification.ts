export enum NotificationType {
  TEXT_EXEMPLE = 'TEXT_EXEMPLE',
  WELCOME_MSG = 'WELCOME_MSG',
  ROOM_INVITE = 'ROOM_INVITE',
  ROOM_DELETED = 'ROOM_DELETED',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  NEW_MESSAGE = 'NEW_MESSAGE',
  FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
}

export interface CreateNotificationDto {
  toUserId:string,
  title: string;
  message: string;
  type: NotificationType;
  friendshipId?: string;
  roomId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  friendshipId?: string | null;
  roomId?: string | null;
  read: boolean;
  request_accepted: boolean;
  createdAt: Date;
}
