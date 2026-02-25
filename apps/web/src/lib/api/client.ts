import axios, { AxiosInstance } from 'axios';
import { signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Client navigateur avec Axios - UNIQUEMENT pour Client Components
class BrowserApiClient {
  private client: AxiosInstance;
  private cachedToken: string | null = null;

  setToken(token: string | null) {
    this.cachedToken = token;
  }

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor - uses cached token, no extra network call
    this.client.interceptors.request.use(
      (config) => {
        if (this.cachedToken) {
          config.headers.Authorization = `Bearer ${this.cachedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Redirect to signin on 401 responses (expired/invalid token)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await signOut({ redirectTo: '/signin' });
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config = {}) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config = {}) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config = {}) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config = {}) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config = {}) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export le client navigateur - pour Client Components UNIQUEMENT
export const apiClient = new BrowserApiClient();
