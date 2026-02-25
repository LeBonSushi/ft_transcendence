export enum RoomStatus {
  PLANNING = 'PLANNING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum VoteType {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE',
}

export enum ActivityCategory {
  RESTAURANT = 'RESTAURANT',
  MUSEUM = 'MUSEUM',
  NIGHTLIFE = 'NIGHTLIFE',
  OUTDOOR = 'OUTDOOR',
  OTHER = 'OTHER',
}

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  description: string | null;
  status: RoomStatus;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: 'DIRECT_MESSAGE' | 'GROUP';
}

export interface RoomSummary {
  name: string;
  lastMessage: string | null;
  lastMessageDate: Date | null;
  senderUsername: string | null;
  senderPicture: string | null;
  createdAt?: Date;
}

export interface RoomWithLastMessage extends Room {
  lastMessage: string | null;
  lastMessageDate: Date | null;
  senderUsername: string | null;
  senderPicture: string | null;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

export interface UserAvailability {
  id: string;
  roomId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripProposal {
  id: string;
  roomId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budgetEstimate: number | null;
  description: string;
  imageUrl: string | null;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripVote {
  id: string;
  tripProposalId: string;
  userId: string;
  vote: VoteType;
  createdAt: Date;
}

export interface ActivitySuggestion {
  id: string;
  tripProposalId: string;
  suggestedById: string | null;
  title: string;
  description: string;
  category: ActivityCategory;
  estimatedPrice: number | null;
  createdAt: Date;
}
