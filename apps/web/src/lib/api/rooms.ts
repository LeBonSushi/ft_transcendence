import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Room, RoomMember, TripProposal } from '@travel-planner/shared';

export interface CreateRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface CreateProposalDto {
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  estimatedBudget?: number;
}

export interface VoteDto {
  voteType: 'YES' | 'NO' | 'MAYBE';
}

export const roomsApi = {
  createRoom: async (data: CreateRoomDto) => {
    return apiClient.post<Room>(API_ROUTES.ROOMS.CREATE, data);
  },

  getRoom: async (roomId: string) => {
    return apiClient.get<Room>(API_ROUTES.ROOMS.GET(roomId));
  },

  updateRoom: async (roomId: string, data: Partial<CreateRoomDto>) => {
    return apiClient.put<Room>(API_ROUTES.ROOMS.UPDATE(roomId), data);
  },

  deleteRoom: async (roomId: string) => {
    return apiClient.delete(API_ROUTES.ROOMS.DELETE(roomId));
  },

  joinRoom: async (roomId: string) => {
    return apiClient.post<RoomMember>(API_ROUTES.ROOMS.JOIN(roomId));
  },

  leaveRoom: async (roomId: string) => {
    return apiClient.post(API_ROUTES.ROOMS.LEAVE(roomId));
  },

  getRoomMembers: async (roomId: string) => {
    return apiClient.get<RoomMember[]>(API_ROUTES.ROOMS.MEMBERS(roomId));
  },

  updateMemberRole: async (roomId: string, userId: string, role: 'ADMIN' | 'MEMBER') => {
    return apiClient.put(API_ROUTES.ROOMS.UPDATE_ROLE(roomId, userId), { role });
  },

  kickMember: async (roomId: string, userId: string) => {
    return apiClient.delete(API_ROUTES.ROOMS.KICK(roomId, userId));
  },

  // Proposals
  createProposal: async (roomId: string, data: CreateProposalDto) => {
    return apiClient.post<TripProposal>(API_ROUTES.PROPOSALS.CREATE(roomId), data);
  },

  getProposals: async (roomId: string) => {
    return apiClient.get<TripProposal[]>(API_ROUTES.PROPOSALS.LIST(roomId));
  },

  updateProposal: async (roomId: string, proposalId: string, data: Partial<CreateProposalDto>) => {
    return apiClient.put<TripProposal>(API_ROUTES.PROPOSALS.UPDATE(roomId, proposalId), data);
  },

  deleteProposal: async (roomId: string, proposalId: string) => {
    return apiClient.delete(API_ROUTES.PROPOSALS.DELETE(roomId, proposalId));
  },

  selectProposal: async (roomId: string, proposalId: string) => {
    return apiClient.post<TripProposal>(API_ROUTES.PROPOSALS.SELECT(roomId, proposalId));
  },

  // Votes
  voteOnProposal: async (roomId: string, proposalId: string, vote: VoteDto) => {
    return apiClient.post(API_ROUTES.VOTES.VOTE(roomId, proposalId), vote);
  },

  updateVote: async (roomId: string, proposalId: string, vote: VoteDto) => {
    return apiClient.put(API_ROUTES.VOTES.UPDATE(roomId, proposalId), vote);
  },

  deleteVote: async (roomId: string, proposalId: string) => {
    return apiClient.delete(API_ROUTES.VOTES.DELETE(roomId, proposalId));
  },

  getProposalVotes: async (roomId: string, proposalId: string) => {
    return apiClient.get(API_ROUTES.VOTES.LIST(roomId, proposalId));
  },
};
