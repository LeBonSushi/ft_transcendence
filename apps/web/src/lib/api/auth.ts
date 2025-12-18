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

/**
 * Authentication API methods
 *
 * Handles user authentication including registration, login, logout,
 * and OAuth flows for Google, GitHub, and 42.
 */
export const authApi = {
  /**
   * Registers a new user
   *
   * Creates a new user account with email, password, and username.
   * Returns an auth token and user data on success.
   *
   * @param data - Registration data including email, password, username
   * @returns Promise with user and auth token
   */
  register: async (data: RegisterDto) => {
    return apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);
  },

  /**
   * Logs in an existing user
   *
   * Authenticates user with username/email and password.
   * Sets auth session cookie on success.
   *
   * @param data - Login credentials (username or email + password)
   * @returns Promise with user and auth token
   */
  login: async (data: LoginDto) => {
    return apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data);
  },

  /**
   * Logs out the current user
   *
   * Clears the auth session cookie and invalidates the session.
   *
   * @returns Promise that resolves when logout is complete
   */
  logout: async () => {
    return apiClient.post(API_ROUTES.AUTH.LOGOUT);
  },

  /**
   * Gets the currently authenticated user
   *
   * Fetches the user profile using the auth session cookie.
   *
   * @returns Promise with current user data
   */
  getCurrentUser: async () => {
    return apiClient.get<User>(API_ROUTES.AUTH.ME);
  },

  /**
   * Initiates Google OAuth login
   *
   * Opens a popup window with Google's authorization page.
   * User will be prompted to select their Google account.
   * On success, returns the authenticated user data.
   *
   * @returns Promise that resolves with user data when OAuth completes
   */
  loginWithGoogle: (): Promise<User> => {
    return new Promise((resolve, reject) => {
      const url = `${getApiBaseUrl()}${API_ROUTES.AUTH.GOOGLE}`;
      const popup = window.open(url, '_blank', 'width=500,height=600');

      // Listen for OAuth success message
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== getApiBaseUrl().replace(/\/api$/, '')) return;

        if (event.data.type === 'oauth-success' && event.data.user) {
          window.removeEventListener('message', handleMessage);
          resolve(event.data.user);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup) {
        window.removeEventListener('message', handleMessage);
        reject(new Error('Popup blocked by browser'));
      }

      // Cleanup if popup is closed without completing OAuth
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          reject(new Error('OAuth cancelled'));
        }
      }, 500);
    });
  },

  /**
   * Initiates GitHub OAuth login
   *
   * Opens a popup window with GitHub's authorization page.
   * User will be prompted to select their GitHub account.
   * On success, returns the authenticated user data.
   *
   * @returns Promise that resolves with user data when OAuth completes
   */
  loginWithGithub: (): Promise<User> => {
    return new Promise((resolve, reject) => {
      const url = `${getApiBaseUrl()}${API_ROUTES.AUTH.GITHUB}`;
      const popup = window.open(url, '_blank', 'width=500,height=600');

      // Listen for OAuth success message
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== getApiBaseUrl().replace(/\/api$/, '')) return;

        if (event.data.type === 'oauth-success' && event.data.user) {
          window.removeEventListener('message', handleMessage);
          resolve(event.data.user);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup) {
        window.removeEventListener('message', handleMessage);
        reject(new Error('Popup blocked by browser'));
      }

      // Cleanup if popup is closed without completing OAuth
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          reject(new Error('OAuth cancelled'));
        }
      }, 500);
    });
  },

  /**
   * Initiates 42 OAuth login
   *
   * Opens a popup window with 42's (École 42) authorization page.
   * User will authenticate with their 42 intranet account.
   * On success, returns the authenticated user data.
   *
   * @returns Promise that resolves with user data when OAuth completes
   */
  loginWith42: (): Promise<User> => {
    return new Promise((resolve, reject) => {
      const url = `${getApiBaseUrl()}${API_ROUTES.AUTH.FORTY_TWO}`;
      const popup = window.open(url, '_blank', 'width=500,height=600');

      // Listen for OAuth success message
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== getApiBaseUrl().replace(/\/api$/, '')) return;

        if (event.data.type === 'oauth-success' && event.data.user) {
          window.removeEventListener('message', handleMessage);
          resolve(event.data.user);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was blocked
      if (!popup) {
        window.removeEventListener('message', handleMessage);
        reject(new Error('Popup blocked by browser'));
      }

      // Cleanup if popup is closed without completing OAuth
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          reject(new Error('OAuth cancelled'));
        }
      }, 500);
    });
  },
};
