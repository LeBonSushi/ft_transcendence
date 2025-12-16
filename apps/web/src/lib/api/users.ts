import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { User, Profile, Room } from '@travel-planner/shared';

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export const usersApi = {
  getUser: async (userId: string) => {
    return apiClient.get<User>(API_ROUTES.USERS.GET(userId));
  },

  updateProfile: async (userId: string, data: UpdateProfileDto) => {
    return apiClient.put<Profile>(API_ROUTES.USERS.UPDATE(userId), data);
  },

  getUserRooms: async (userId: string) => {
    return apiClient.get<Room[]>(API_ROUTES.USERS.ROOMS(userId));
  },

  getUserFriends: async (userId: string) => {
    return apiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(userId));
  },
};
