import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Friendship } from '@travel-planner/shared';

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
    return apiClient.get<Friendship[]>(API_ROUTES.FRIENDS.REQUESTS);
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
    return apiClient.get<Friendship[]>(API_ROUTES.FRIENDS.REQUESTS);
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

  removeFriend: async (friendshipId: string) => {
    return apiClient.delete(API_ROUTES.FRIENDS.DELETE(friendshipId));
  },

  blockFriend: async (friendshipId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.BLOCK(friendshipId));
  },

  unblockFriend: async (friendshipId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.UNBLOCK(friendshipId));
  },
};
