import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Friendship } from '@travel-planner/shared';

/**
 * Friends API methods
 *
 * Handles friendship operations including sending/accepting requests,
 * removing friends, and blocking/unblocking users.
 */
export const friendsApi = {
  /**
   * Gets all friend requests for the current user
   *
   * Fetches pending friend requests (both sent and received).
   *
   * @returns Promise with array of friendship requests
   */
  getFriendRequests: async () => {
    return apiClient.get<Friendship[]>(API_ROUTES.FRIENDS.REQUESTS);
  },

  /**
   * Sends a friend request to a user
   *
   * Creates a new friendship request. The recipient will need to
   * accept it before becoming friends.
   *
   * @param userId - ID of the user to send request to
   * @returns Promise with created friendship data
   */
  sendFriendRequest: async (userId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.SEND(userId));
  },

  /**
   * Accepts a friend request
   *
   * Accepts a pending friendship request, making both users friends.
   *
   * @param friendshipId - ID of the friendship to accept
   * @returns Promise with updated friendship data
   */
  acceptFriendRequest: async (friendshipId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.ACCEPT(friendshipId));
  },

  /**
   * Rejects a friend request
   *
   * Rejects a pending friendship request.
   *
   * @param friendshipId - ID of the friendship to reject
   * @returns Promise that resolves when rejection is complete
   */
  rejectFriendRequest: async (friendshipId: string) => {
    return apiClient.post(API_ROUTES.FRIENDS.REJECT(friendshipId));
  },

  /**
   * Removes a friend
   *
   * Deletes an existing friendship. Both users will no longer be friends.
   *
   * @param friendshipId - ID of the friendship to remove
   * @returns Promise that resolves when removal is complete
   */
  removeFriend: async (friendshipId: string) => {
    return apiClient.delete(API_ROUTES.FRIENDS.DELETE(friendshipId));
  },

  /**
   * Blocks a friend
   *
   * Blocks a user, preventing all interactions.
   *
   * @param friendshipId - ID of the friendship to block
   * @returns Promise with updated friendship data
   */
  blockFriend: async (friendshipId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.BLOCK(friendshipId));
  },

  /**
   * Unblocks a friend
   *
   * Removes the block from a previously blocked user.
   *
   * @param friendshipId - ID of the friendship to unblock
   * @returns Promise with updated friendship data
   */
  unblockFriend: async (friendshipId: string) => {
    return apiClient.post<Friendship>(API_ROUTES.FRIENDS.UNBLOCK(friendshipId));
  },
};
