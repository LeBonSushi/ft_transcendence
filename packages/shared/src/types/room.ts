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
  description?: string;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripProposal {
  id: string;
  roomId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budgetEstimate?: number;
  description: string;
  imageUrl?: string;
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
  suggestedById?: string;
  title: string;
  description: string;
  category: ActivityCategory;
  estimatedPrice?: number;
  createdAt: Date;
}
