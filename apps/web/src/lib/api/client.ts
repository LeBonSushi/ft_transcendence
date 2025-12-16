import axios, { AxiosInstance } from 'axios';

// Use proxy in browser, direct URL on server-side
const API_URL = typeof window !== 'undefined'
  ? '/api'  // Client-side: use Next.js proxy
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'; // Server-side

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Generic HTTP methods
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

  // Get the raw axios instance if needed
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
