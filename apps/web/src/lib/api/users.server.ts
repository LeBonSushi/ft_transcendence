import 'server-only';
import { serverApiClient } from './server';
import { API_ROUTES } from '@travel-planner/shared';
import type { User, Room } from '@travel-planner/shared';

// Classe pour permettre le chaînage de méthodes - version serveur
class ServerUserResource {
  constructor(private userId: string) {}

  async getRooms() {
    return serverApiClient.get<Room[]>(API_ROUTES.USERS.ROOMS(this.userId));
  }

  async getFriends() {
    return serverApiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(this.userId));
  }

  async getProfile() {
    return serverApiClient.get<User>(API_ROUTES.USERS.GET(this.userId));
  }
}

// Classe pour l'utilisateur courant - version serveur
class ServerCurrentUserResource {
  async getRooms() {
    return serverApiClient.get<Room[]>(API_ROUTES.USERS.ME_ROOMS);
  }

  async getProfile() {
    return serverApiClient.get<User>(API_ROUTES.USERS.ME);
  }
}

// API Users pour Server Components UNIQUEMENT
export const serverUsersApi = {
  getCurrentUser: () => {
    return new ServerCurrentUserResource();
  },

  getUser: (userId: string) => {
    return new ServerUserResource(userId);
  },

  getMyRooms: async () => {
    return serverApiClient.get<Room[]>(API_ROUTES.USERS.ME_ROOMS);
  },

  getUserRooms: async (userId: string) => {
    return serverApiClient.get<Room[]>(API_ROUTES.USERS.ROOMS(userId));
  },

  getUserFriends: async (userId: string) => {
    return serverApiClient.get<User[]>(API_ROUTES.USERS.FRIENDS(userId));
  },
};
