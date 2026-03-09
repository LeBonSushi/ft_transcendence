import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Friendship } from '@travel-planner/shared';

export interface FriendshipRelation extends Friendship {
  user: {
    id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePicture: string | null;
    } | null;
  };
  friend: {
    id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePicture: string | null;
    } | null;
  };
}

interface FriendRequestsResponse {
  friend_request?: Friendship[];
}

// Classe pour gérer une amitié spécifique
class FriendshipResource {
  constructor(private friendshipId: string) {}

  async accept() {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.ACCEPT(this.friendshipId));
  }

  async reject() {
    return apiClient.post(API_ROUTES.FRIENDS.REJECT(this.friendshipId));
  }

  async remove() {
    return apiClient.delete(API_ROUTES.FRIENDS.DELETE(this.friendshipId));
  }

  async block() {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.BLOCK(this.friendshipId));
  }

  async unblock() {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.UNBLOCK(this.friendshipId));
  }
}

export const friendsApi = {
  // Méthodes pour gérer les demandes
  async getRequests() {
    const response = await apiClient.get<FriendRequestsResponse>(API_ROUTES.FRIENDS.REQUESTS);
    return response.friend_request ?? [];
  },

  async getRelations() {
    return apiClient.get<FriendshipRelation[]>(API_ROUTES.FRIENDS.RELATIONS);
  },

  async sendRequest(userId: string) {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.SEND(userId));
  },

  // Retourne une instance pour le chaînage
  friendship: (friendshipId: string) => {
    return new FriendshipResource(friendshipId);
  },

  // Méthodes directes pour compatibilité
  getFriendRequests: async () => {
    const response = await apiClient.get<FriendRequestsResponse>(API_ROUTES.FRIENDS.REQUESTS);
    return response.friend_request ?? [];
  },

  sendFriendRequest: async (userId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.SEND(userId));
  },

  acceptFriendRequest: async (friendshipId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.ACCEPT(friendshipId));
  },

  rejectFriendRequest: async (friendshipId: string) => {
    return apiClient.post(API_ROUTES.FRIENDS.REJECT(friendshipId));
  },

  removeFriend: async (targetId: string) => {
    return apiClient.delete(API_ROUTES.FRIENDS.DELETE(targetId));
  },

  blockFriend: async (targetId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.BLOCK(targetId));
  },

  unblockFriend: async (targetId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.UNBLOCK(targetId));
  },
};
