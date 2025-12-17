import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Direct connection to backend
const API_URL = 'http://localhost:4000/api';

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

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          const msg = (error.response.data as any)?.message || 'Une erreur est survenue';
          toast.error(msg);
        }
        else if (error.request) {
          toast.error('Erreur de connexion au serveur');
        }
        else {
          toast.error('Une erreur inattendue est survenue');
        }
        return Promise.reject(error);
      }
    );
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
