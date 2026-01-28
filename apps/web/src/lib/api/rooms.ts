import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Room, RoomMember, TripProposal } from '@travel-planner/shared';

export interface CreateRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
  password?: string;
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

// Classe pour gérer les propositions d'une room
class ProposalResource {
  constructor(private roomId: string, private proposalId: string) {}

  async get() {
    const proposals = await apiClient.get<TripProposal[]>(API_ROUTES.PROPOSALS.LIST(this.roomId));
    return proposals.find(p => p.id === this.proposalId);
  }

  async update(data: Partial<CreateProposalDto>) {
    return apiClient.put<TripProposal>(API_ROUTES.PROPOSALS.UPDATE(this.roomId, this.proposalId), data);
  }

  async delete() {
    return apiClient.delete(API_ROUTES.PROPOSALS.DELETE(this.roomId, this.proposalId));
  }

  async select() {
    return apiClient.post<TripProposal>(API_ROUTES.PROPOSALS.SELECT(this.roomId, this.proposalId));
  }

  async vote(vote: VoteDto) {
    return apiClient.post(API_ROUTES.VOTES.VOTE(this.roomId, this.proposalId), vote);
  }

  async updateVote(vote: VoteDto) {
    return apiClient.put(API_ROUTES.VOTES.UPDATE(this.roomId, this.proposalId), vote);
  }

  async deleteVote() {
    return apiClient.delete(API_ROUTES.VOTES.DELETE(this.roomId, this.proposalId));
  }

  async getVotes() {
    return apiClient.get(API_ROUTES.VOTES.LIST(this.roomId, this.proposalId));
  }
}

// Classe pour gérer une room spécifique
class RoomResource {
  constructor(private roomId: string) {}

  async get() {
    return apiClient.get<Room>(API_ROUTES.ROOMS.GET(this.roomId));
  }

  async update(data: Partial<CreateRoomDto>) {
    return apiClient.put<Room>(API_ROUTES.ROOMS.UPDATE(this.roomId), data);
  }

  async delete() {
    return apiClient.delete(API_ROUTES.ROOMS.DELETE(this.roomId));
  }

  async join() {
    return apiClient.post<RoomMember>(API_ROUTES.ROOMS.JOIN(this.roomId));
  }

  async leave() {
    return apiClient.post(API_ROUTES.ROOMS.LEAVE(this.roomId));
  }

  async getMembers() {
    return apiClient.get<RoomMember[]>(API_ROUTES.ROOMS.MEMBERS(this.roomId));
  }

  async updateMemberRole(userId: string, role: 'ADMIN' | 'MEMBER') {
    return apiClient.put(API_ROUTES.ROOMS.UPDATE_ROLE(this.roomId, userId), { role });
  }

  async kickMember(userId: string) {
    return apiClient.delete(API_ROUTES.ROOMS.KICK(this.roomId, userId));
  }

  // Proposals
  async getProposals() {
    return apiClient.get<TripProposal[]>(API_ROUTES.PROPOSALS.LIST(this.roomId));
  }

  async createProposal(data: CreateProposalDto) {
    return apiClient.post<TripProposal>(API_ROUTES.PROPOSALS.CREATE(this.roomId), data);
  }

  proposal(proposalId: string) {
    return new ProposalResource(this.roomId, proposalId);
  }
}

export const roomsApi = {
  // Retourne une instance de room pour le chaînage
  getRoom: (roomId: string) => {
    return new RoomResource(roomId);
  },

  // Méthodes directes
  create: async (data: CreateRoomDto) => {
    return apiClient.post<Room>(API_ROUTES.ROOMS.CREATE, data);
  },

  // Compatibilité avec l'ancien code
  createRoom: async (data: CreateRoomDto) => {
    return apiClient.post<Room>(API_ROUTES.ROOMS.CREATE, data);
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
