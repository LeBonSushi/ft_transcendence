import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { User, Profile, Room } from '@travel-planner/shared';

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Users API methods
 *
 * Handles user profile operations including fetching user data,
 * updating profiles, and retrieving user relationships.
 */
export const usersApi = {
  /**
   * Gets a user by ID
   *
   * Fetches detailed user information including profile data.
   *
   * @param userId - The user's unique identifier
   * @returns Promise with user data
   */
  getUser: async (userId: string) => {
    return apiClient.get<User>(API_ROUTES.USERS.GET(userId));
  },

  /**
   * Updates a user's profile
   *
   * Updates user profile information such as display name, bio, and avatar.
   * Only the authenticated user can update their own profile.
   *
   * @param userId - The user's unique identifier
   * @param data - Profile data to update (displayName, bio, avatarUrl)
   * @returns Promise with updated profile data
   */
  updateProfile: async (userId: string, data: UpdateProfileDto) => {
    return apiClient.put<Profile>(API_ROUTES.USERS.UPDATE(userId), data);
  },

  /**
   * Gets all rooms for a user
   *
   * Fetches all travel planning rooms the user is a member of.
   *
   * @param userId - The user's unique identifier
   * @returns Promise with array of rooms
   */
  getUserRooms: async (userId: string) => {
    return apiClient.get<Room[]>(API_ROUTES.USERS.ROOMS(userId));
  },

  /**
   * Gets all friends for a user
   *
   * Fetches the user's friend list (accepted friendships only).
   *
   * @param userId - The user's unique identifier
   * @returns Promise with array of friend users
   */
  getUserFriends: async (userId: string) => {
    return apiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(userId));
  },
};
