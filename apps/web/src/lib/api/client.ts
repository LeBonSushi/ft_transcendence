import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { config } from '../config';

/**
 * API Client wrapper around axios
 *
 * Handles all HTTP requests to the backend API with automatic error handling,
 * authentication via cookies, and toast notifications.
 */
class ApiClient {
  private client: AxiosInstance;

  /**
   * Creates a new API client instance
   *
   * Sets up axios with base configuration including:
   * - Base URL from config
   * - Credentials (cookies) enabled
   * - Response interceptor for error handling
   */
  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
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

  /**
   * Performs a GET request
   *
   * @template T - Expected response data type
   * @param url - API endpoint URL
   * @param config - Additional axios config
   * @returns Promise with the response data
   */
  async get<T>(url: string, config = {}) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Performs a POST request
   *
   * @template T - Expected response data type
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   * @returns Promise with the response data
   */
  async post<T>(url: string, data?: unknown, config = {}) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a PUT request
   *
   * @template T - Expected response data type
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   * @returns Promise with the response data
   */
  async put<T>(url: string, data?: unknown, config = {}) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a PATCH request
   *
   * @template T - Expected response data type
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   * @returns Promise with the response data
   */
  async patch<T>(url: string, data?: unknown, config = {}) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a DELETE request
   *
   * @template T - Expected response data type
   * @param url - API endpoint URL
   * @param config - Additional axios config
   * @returns Promise with the response data
   */
  async delete<T>(url: string, config = {}) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Gets the raw axios instance
   *
   * Use this when you need direct access to axios features
   * not exposed by the wrapper methods.
   *
   * @returns The axios instance
   */
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
