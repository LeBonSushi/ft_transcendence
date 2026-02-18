import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type {
  RoomMemberWithUser,
  RoomWithDetails,
  RoomWithMembers,
  TripProposalWithRelations,
  TripProposalWithVotesAndActivities,
  TripVoteWithUser,
  ActivitySuggestionWithUser,
  CreateRoomDto,
  UpdateRoomDto,
  CreateProposalDto,
  UpdateProposalDto,
  CreateVoteDto,
  CreateActivityDto,
  UpdateActivityDto,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  UpdateRoleDto,
  UserAvailabilityWithUser,
} from '@travel-planner/shared';

// Classe pour gérer les propositions d'une room
class ProposalResource {
  constructor(private roomId: string, private proposalId: string) {}

  async update(data: UpdateProposalDto) {
    return apiClient.put<TripProposalWithRelations>(API_ROUTES.PROPOSALS.UPDATE(this.roomId, this.proposalId), data);
  }

  async delete() {
    return apiClient.delete(API_ROUTES.PROPOSALS.DELETE(this.roomId, this.proposalId));
  }

  async select() {
    return apiClient.post<TripProposalWithRelations>(API_ROUTES.PROPOSALS.SELECT(this.roomId, this.proposalId));
  }

  // Votes
  async vote(data: CreateVoteDto) {
    return apiClient.post<TripVoteWithUser>(API_ROUTES.VOTES.VOTE(this.roomId, this.proposalId), data);
  }

  async updateVote(data: CreateVoteDto) {
    return apiClient.put<TripVoteWithUser>(API_ROUTES.VOTES.UPDATE(this.roomId, this.proposalId), data);
  }

  async deleteVote() {
    return apiClient.delete(API_ROUTES.VOTES.DELETE(this.roomId, this.proposalId));
  }

  async getVotes() {
    return apiClient.get<TripVoteWithUser[]>(API_ROUTES.VOTES.LIST(this.roomId, this.proposalId));
  }

  // Activities
  async getActivities() {
    return apiClient.get<ActivitySuggestionWithUser[]>(API_ROUTES.ACTIVITIES.LIST(this.roomId, this.proposalId));
  }

  async createActivity(data: CreateActivityDto) {
    return apiClient.post<ActivitySuggestionWithUser>(API_ROUTES.ACTIVITIES.CREATE(this.roomId, this.proposalId), data);
  }

  async updateActivity(activityId: string, data: UpdateActivityDto) {
    return apiClient.put<ActivitySuggestionWithUser>(API_ROUTES.ACTIVITIES.UPDATE(this.roomId, this.proposalId, activityId), data);
  }

  async deleteActivity(activityId: string) {
    return apiClient.delete(API_ROUTES.ACTIVITIES.DELETE(this.roomId, this.proposalId, activityId));
  }
}

// Classe pour gérer une room spécifique
class RoomResource {
  constructor(private roomId: string) {}

  async get() {
    return apiClient.get<RoomWithDetails>(API_ROUTES.ROOMS.GET(this.roomId));
  }

  async update(data: UpdateRoomDto) {
    return apiClient.put<RoomWithMembers>(API_ROUTES.ROOMS.UPDATE(this.roomId), data);
  }

  async delete() {
    return apiClient.delete(API_ROUTES.ROOMS.DELETE(this.roomId));
  }

  async join() {
    return apiClient.post<RoomMemberWithUser>(API_ROUTES.ROOMS.JOIN(this.roomId));
  }

  async leave() {
    return apiClient.post(API_ROUTES.ROOMS.LEAVE(this.roomId));
  }

  async getMembers() {
    return apiClient.get<RoomMemberWithUser[]>(API_ROUTES.ROOMS.MEMBERS(this.roomId));
  }

  async updateMemberRole(userId: string, data: UpdateRoleDto) {
    return apiClient.put<RoomMemberWithUser>(API_ROUTES.ROOMS.UPDATE_ROLE(this.roomId, userId), data);
  }

  async kickMember(userId: string) {
    return apiClient.delete(API_ROUTES.ROOMS.KICK(this.roomId, userId));
  }

  // Availabilities
  async getAvailabilities() {
    return apiClient.get<UserAvailabilityWithUser[]>(API_ROUTES.AVAILABILITY.LIST(this.roomId));
  }

  async createAvailability(data: CreateAvailabilityDto) {
    return apiClient.post<UserAvailabilityWithUser>(API_ROUTES.AVAILABILITY.CREATE(this.roomId), data);
  }

  async updateAvailability(id: string, data: UpdateAvailabilityDto) {
    return apiClient.put<UserAvailabilityWithUser>(API_ROUTES.AVAILABILITY.UPDATE(this.roomId, id), data);
  }

  async deleteAvailability(id: string) {
    return apiClient.delete(API_ROUTES.AVAILABILITY.DELETE(this.roomId, id));
  }

  // Proposals
  async getProposals() {
    return apiClient.get<TripProposalWithVotesAndActivities[]>(API_ROUTES.PROPOSALS.LIST(this.roomId));
  }

  async createProposal(data: CreateProposalDto) {
    return apiClient.post<TripProposalWithRelations>(API_ROUTES.PROPOSALS.CREATE(this.roomId), data);
  }

  proposal(proposalId: string) {
    return new ProposalResource(this.roomId, proposalId);
  }
}

export const roomsApi = {
  getRoom: (roomId: string) => new RoomResource(roomId),

  create: async (data: CreateRoomDto) => {
    return apiClient.post<RoomWithMembers>(API_ROUTES.ROOMS.CREATE, data);
  },
};
