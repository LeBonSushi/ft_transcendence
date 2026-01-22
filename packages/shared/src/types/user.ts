export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED',
}

export interface User {
  id: string;
  username: string;
  email: string;
  oauthProvider?: string;
  oauthId?: string;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate {
  user: User;
  warnings?: string[];
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  birthdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

// export interface RoomSummary {
// 	name: string;
// 	lastMessage: string;
// 	senderUsername: string;
// 	senderPicture: string;
// 	lastMessageDate: string;
// 	createdAt?: Date;
// }