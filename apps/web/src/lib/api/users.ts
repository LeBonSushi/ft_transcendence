import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type {
  User,
  Profile,
  UserUpdate,
  RoomWithLastMessage,
  UpdateProfileDto,
} from '@travel-planner/shared';

// Classe pour permettre le chaînage de méthodes
class UserResource {
  constructor(private userId: string) {}

  async getRooms() {
    return apiClient.get<RoomWithLastMessage[]>(API_ROUTES.USERS.ROOMS(this.userId));
  }

  async getFriends() {
    return apiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(this.userId));
  }

  async getProfile() {
    return apiClient.get<User>(API_ROUTES.USERS.GET(this.userId));
  }

  async update(data: UpdateProfileDto) {
    return apiClient.put<UserUpdate>(API_ROUTES.USERS.UPDATE(this.userId), data);
  }
}

// Classe pour l'utilisateur courant
class CurrentUserResource {
  async getRooms() {
    return apiClient.get<RoomWithLastMessage[]>(API_ROUTES.USERS.ME_ROOMS);
  }

  async getProfile() {
    return apiClient.get<User>(API_ROUTES.USERS.ME);
  }

  async update(data: UpdateProfileDto) {
    return apiClient.put<UserUpdate>(API_ROUTES.USERS.ME, data);
  }
}

export const usersApi = {
  getCurrentUser: () => new CurrentUserResource(),

  getUser: (userId: string) => new UserResource(userId),

  getMyRooms: async () => {
    return apiClient.get<RoomWithLastMessage[]>(API_ROUTES.USERS.ME_ROOMS);
  },

  getUserRooms: async (userId: string) => {
    return apiClient.get<RoomWithLastMessage[]>(API_ROUTES.USERS.ROOMS(userId));
  },

  getUserFriends: async (userId: string) => {
    return apiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(userId));
  },

  updateProfile: async (userId: string, data: UpdateProfileDto) => {
    return apiClient.put<Profile>(API_ROUTES.USERS.UPDATE(userId), data);
  },

  updateUser: async (userId: string, data: UpdateProfileDto) => {
    return apiClient.put<UserUpdate>(API_ROUTES.USERS.UPDATE(userId), data);
  },
};
