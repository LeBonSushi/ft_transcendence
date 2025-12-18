import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { User } from '@travel-planner/shared';
import React from 'react';
import { getApiBaseUrl } from '../config';

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: async (data: RegisterDto) => {
    return apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);
  },

  login: async (data: LoginDto) => {
    return apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data);
  },

  logout: async () => {
    return apiClient.post(API_ROUTES.AUTH.LOGOUT);
  },

  getCurrentUser: async () => {
    return apiClient.get<User>(API_ROUTES.AUTH.ME);
  },

  // OAuth login methods
  loginWithGoogle: () => {
    const url = `${getApiBaseUrl()}${API_ROUTES.AUTH.GOOGLE}`;

    window.open(url, '_blank', 'width=500,height=600');
  },

  loginWithGithub: () => {
    const url = `${getApiBaseUrl()}${API_ROUTES.AUTH.GITHUB}`;

    window.open(url, '_blank', 'width=500,height=600');
  },

  loginWith42: () => {
    const url = `${getApiBaseUrl()}${API_ROUTES.AUTH.FORTY_TWO}`;

    window.open(url, '_blank', 'width=500,height=600');
  },
};
