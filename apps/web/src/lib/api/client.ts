import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Client navigateur avec Axios et Clerk - UNIQUEMENT pour Client Components
class BrowserApiClient {
  private client: AxiosInstance;
  private clerkReady: Promise<void> | null = null;
  private initialized = false;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur Axios pour Clerk
    this.client.interceptors.request.use(
      async (config) => {
        // Initialiser Clerk seulement côté client
        if (typeof window !== 'undefined' && !this.initialized) {
          this.initClerk();
          this.initialized = true;
        }

        if (this.clerkReady) {
          await this.clerkReady;
        }
        try {
          if (typeof window !== 'undefined') {
            const clerk = (window as any).Clerk;
            if (clerk && clerk.session) {
              const token = await clerk.session.getToken();
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          }
        } catch (error) {
          console.error('Error getting Clerk token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private initClerk() {
    if (typeof window === 'undefined') return;

    this.clerkReady = new Promise((resolve) => {
      const checkClerk = () => {
        const clerk = (window as any).Clerk;
        if (clerk && clerk.loaded) {
          resolve();
        } else {
          window.addEventListener('clerk:loaded', () => resolve(), { once: true });
          const interval = setInterval(() => {
            const clerk = (window as any).Clerk;
            if (clerk && clerk.loaded) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
          setTimeout(() => {
            clearInterval(interval);
            resolve();
          }, 10000);
        }
      };
      checkClerk();
    });
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
