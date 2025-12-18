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

/**
 * Rooms API methods
 *
 * Handles travel planning room operations including room management,
 * trip proposals, and voting on destinations.
 */
export const roomsApi = {
  /**
   * Creates a new room
   *
   * Creates a travel planning room where users can collaborate
   * on trip destinations and dates.
   *
   * @param data - Room creation data (name, description, privacy)
   * @returns Promise with created room data
   */
  createRoom: async (data: CreateRoomDto) => {
    return apiClient.post<Room>(API_ROUTES.ROOMS.CREATE, data);
  },

  /**
   * Gets a room by ID
   *
   * Fetches detailed room information including members and proposals.
   *
   * @param roomId - The room's unique identifier
   * @returns Promise with room data
   */
  getRoom: async (roomId: string) => {
    return apiClient.get<Room>(API_ROUTES.ROOMS.GET(roomId));
  },

  /**
   * Updates a room
   *
   * Updates room information such as name, description, or privacy settings.
   * Only room admins can update room settings.
   *
   * @param roomId - The room's unique identifier
   * @param data - Room data to update
   * @returns Promise with updated room data
   */
  updateRoom: async (roomId: string, data: Partial<CreateRoomDto>) => {
    return apiClient.put<Room>(API_ROUTES.ROOMS.UPDATE(roomId), data);
  },

  /**
   * Deletes a room
   *
   * Permanently deletes a room and all associated data.
   * Only room admins can delete rooms.
   *
   * @param roomId - The room's unique identifier
   * @returns Promise that resolves when deletion is complete
   */
  deleteRoom: async (roomId: string) => {
    return apiClient.delete(API_ROUTES.ROOMS.DELETE(roomId));
  },

  /**
   * Joins a room
   *
   * Adds the current user as a member of the room.
   *
   * @param roomId - The room's unique identifier
   * @returns Promise with room member data
   */
  joinRoom: async (roomId: string) => {
    return apiClient.post<RoomMember>(API_ROUTES.ROOMS.JOIN(roomId));
  },

  /**
   * Leaves a room
   *
   * Removes the current user from the room.
   *
   * @param roomId - The room's unique identifier
   * @returns Promise that resolves when user has left
   */
  leaveRoom: async (roomId: string) => {
    return apiClient.post(API_ROUTES.ROOMS.LEAVE(roomId));
  },

  /**
   * Gets all members of a room
   *
   * Fetches the list of users who are members of the room
   * along with their roles (admin/member).
   *
   * @param roomId - The room's unique identifier
   * @returns Promise with array of room members
   */
  getRoomMembers: async (roomId: string) => {
    return apiClient.get<RoomMember[]>(API_ROUTES.ROOMS.MEMBERS(roomId));
  },

  /**
   * Updates a member's role
   *
   * Changes a room member's role (admin or member).
   * Only admins can update member roles.
   *
   * @param roomId - The room's unique identifier
   * @param userId - The user's unique identifier
   * @param role - New role ('ADMIN' or 'MEMBER')
   * @returns Promise that resolves when role is updated
   */
  updateMemberRole: async (roomId: string, userId: string, role: 'ADMIN' | 'MEMBER') => {
    return apiClient.put(API_ROUTES.ROOMS.UPDATE_ROLE(roomId, userId), { role });
  },

  /**
   * Kicks a member from the room
   *
   * Removes a user from the room. Only admins can kick members.
   *
   * @param roomId - The room's unique identifier
   * @param userId - The user to kick
   * @returns Promise that resolves when member is kicked
   */
  kickMember: async (roomId: string, userId: string) => {
    return apiClient.delete(API_ROUTES.ROOMS.KICK(roomId, userId));
  },

  /**
   * Creates a trip proposal
   *
   * Creates a new travel destination proposal for the room.
   * Members can then vote on proposals to decide where to travel.
   *
   * @param roomId - The room's unique identifier
   * @param data - Proposal data (destination, dates, budget, etc.)
   * @returns Promise with created proposal data
   */
  createProposal: async (roomId: string, data: CreateProposalDto) => {
    return apiClient.post<TripProposal>(API_ROUTES.PROPOSALS.CREATE(roomId), data);
  },

  /**
   * Gets all proposals for a room
   *
   * Fetches all travel proposals submitted for the room.
   *
   * @param roomId - The room's unique identifier
   * @returns Promise with array of proposals
   */
  getProposals: async (roomId: string) => {
    return apiClient.get<TripProposal[]>(API_ROUTES.PROPOSALS.LIST(roomId));
  },

  /**
   * Updates a trip proposal
   *
   * Updates an existing proposal's details.
   * Only the proposal creator can update it.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @param data - Proposal data to update
   * @returns Promise with updated proposal data
   */
  updateProposal: async (roomId: string, proposalId: string, data: Partial<CreateProposalDto>) => {
    return apiClient.put<TripProposal>(API_ROUTES.PROPOSALS.UPDATE(roomId, proposalId), data);
  },

  /**
   * Deletes a trip proposal
   *
   * Removes a proposal from the room.
   * Only the proposal creator or room admins can delete proposals.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @returns Promise that resolves when deletion is complete
   */
  deleteProposal: async (roomId: string, proposalId: string) => {
    return apiClient.delete(API_ROUTES.PROPOSALS.DELETE(roomId, proposalId));
  },

  /**
   * Selects a proposal as the final trip destination
   *
   * Marks a proposal as the selected/confirmed trip for the room.
   * Only room admins can select proposals.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @returns Promise with updated proposal data
   */
  selectProposal: async (roomId: string, proposalId: string) => {
    return apiClient.post<TripProposal>(API_ROUTES.PROPOSALS.SELECT(roomId, proposalId));
  },

  /**
   * Votes on a trip proposal
   *
   * Casts a vote (YES/NO/MAYBE) on a travel proposal.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @param vote - Vote data (YES, NO, or MAYBE)
   * @returns Promise that resolves when vote is cast
   */
  voteOnProposal: async (roomId: string, proposalId: string, vote: VoteDto) => {
    return apiClient.post(API_ROUTES.VOTES.VOTE(roomId, proposalId), vote);
  },

  /**
   * Updates an existing vote
   *
   * Changes a previously cast vote on a proposal.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @param vote - New vote data (YES, NO, or MAYBE)
   * @returns Promise that resolves when vote is updated
   */
  updateVote: async (roomId: string, proposalId: string, vote: VoteDto) => {
    return apiClient.put(API_ROUTES.VOTES.UPDATE(roomId, proposalId), vote);
  },

  /**
   * Deletes a vote
   *
   * Removes the current user's vote from a proposal.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @returns Promise that resolves when vote is deleted
   */
  deleteVote: async (roomId: string, proposalId: string) => {
    return apiClient.delete(API_ROUTES.VOTES.DELETE(roomId, proposalId));
  },

  /**
   * Gets all votes for a proposal
   *
   * Fetches all votes cast on a specific proposal.
   *
   * @param roomId - The room's unique identifier
   * @param proposalId - The proposal's unique identifier
   * @returns Promise with array of votes
   */
  getProposalVotes: async (roomId: string, proposalId: string) => {
    return apiClient.get(API_ROUTES.VOTES.LIST(roomId, proposalId));
  },
};
