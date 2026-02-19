import { VoteType, MemberRole } from './room';

// Room DTOs
export interface CreateRoomDto {
  name: string;
  type: 'GROUP' | 'DIRECT_MESSAGE';
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateRoomDto {
  name?: string;
  description?: string;
}

// RoomMember DTOs
export interface UpdateRoleDto {
  role: MemberRole;
}

// Availability DTOs
export interface CreateAvailabilityDto {
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface UpdateAvailabilityDto {
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// TripProposal DTOs
export interface CreateProposalDto {
  destination: string;
  startDate: string;
  endDate: string;
  budgetEstimate?: number;
  description: string;
  imageUrl?: string;
}

export interface UpdateProposalDto {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budgetEstimate?: number;
  description?: string;
  imageUrl?: string;
}

// Activity DTOs
export interface CreateActivityDto {
  title: string;
  description?: string;
  category: 'RESTAURANT' | 'MUSEUM' | 'NIGHTLIFE' | 'OUTDOOR' | 'OTHER';
  estimatedPrice?: number;
}

export interface UpdateActivityDto {
  title?: string;
  description?: string;
  category?: 'RESTAURANT' | 'MUSEUM' | 'NIGHTLIFE' | 'OUTDOOR' | 'OTHER';
  estimatedPrice?: number;
}

// Vote DTOs
export interface CreateVoteDto {
  vote: VoteType;
}

// Friend DTOs
export interface SendFriendRequestDto {
  friendId: string;
}

export interface UpdateFriendRequestDto {
  status: 'ACCEPTED' | 'BLOCKED';
}

// User DTOs
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  birthdate?: string;
  profilePicture?: string;
}
