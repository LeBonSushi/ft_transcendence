import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Friendship } from '@travel-planner/shared';

export const friendsApi = {
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
