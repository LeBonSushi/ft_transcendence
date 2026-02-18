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
  profile: Profile | null;
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
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  birthdate: Date | null;
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
export interface SearchUser {
  id : string;
  username: string;
  profile: { 
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }
}
