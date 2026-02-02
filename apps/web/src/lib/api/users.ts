import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { User, Profile, Room, UserUpdate } from '@travel-planner/shared';

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  birthdate?: string;
}

// Classe pour permettre le chaînage de méthodes
class UserResource {
  constructor(private userId: string) {}

  async getRooms() {
    return apiClient.get<Room[]>(API_ROUTES.USERS.ROOMS(this.userId));
  }

  async getFriends() {
    return apiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(this.userId));
  }

  async getProfile() {
    return apiClient.get<User>(API_ROUTES.USERS.GET(this.userId));
  }

  async update(data: UpdateUserDto) {
    return apiClient.put<UserUpdate>(API_ROUTES.USERS.UPDATE(this.userId), data);
  }
}

// Classe pour l'utilisateur courant
class CurrentUserResource {
  async getRooms() {
    return apiClient.get<Room[]>(API_ROUTES.USERS.ME_ROOMS);
  }

  async getProfile() {
    return apiClient.get<User>(API_ROUTES.USERS.ME);
  }

  async update(data: UpdateUserDto) {
    return apiClient.put<UserUpdate>(API_ROUTES.USERS.ME, data);
  }
}

export const usersApi = {
  // Retourne une instance avec des méthodes chaînables
  getCurrentUser: () => {
    return new CurrentUserResource();
  },

  // Retourne une instance pour un utilisateur spécifique
  getUser: (userId: string) => {
    return new UserResource(userId);
  },

  // Méthodes directes pour compatibilité
  getMyRooms: async () => {
    return apiClient.get<Room[]>(API_ROUTES.USERS.ME_ROOMS);
  },

  getUserRooms: async (userId: string) => {
    return apiClient.get<Room[]>(API_ROUTES.USERS.ROOMS(userId));
  },

  getUserFriends: async (userId: string) => {
    return apiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(userId));
  },

  updateProfile: async (userId: string, data: UpdateProfileDto) => {
    return apiClient.put<Profile>(API_ROUTES.USERS.UPDATE(userId), data);
  },

  updateUser: async (userId: string, data: UpdateUserDto) => {
    return apiClient.put<UserUpdate>(API_ROUTES.USERS.UPDATE(userId), data);
  },
};
