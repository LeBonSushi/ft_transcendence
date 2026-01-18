import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private client: AxiosInstance;
  private clerkReady: Promise<void> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Créer une promise qui se résout quand Clerk est prêt
    if (typeof window !== 'undefined') {
      this.clerkReady = new Promise((resolve) => {
        const checkClerk = () => {
          const clerk = (window as any).Clerk;
          if (clerk && clerk.loaded) {
            resolve();
          } else {
            // Attendre que Clerk soit chargé
            window.addEventListener('clerk:loaded', () => resolve(), { once: true });
            // Fallback: vérifier toutes les 100ms
            const interval = setInterval(() => {
              const clerk = (window as any).Clerk;
              if (clerk && clerk.loaded) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
            // Timeout après 10 secondes
            setTimeout(() => {
              clearInterval(interval);
              resolve(); // Résoudre quand même pour éviter de bloquer indéfiniment
            }, 10000);
          }
        };
        checkClerk();
      });
    }

    // Intercepteur pour ajouter le token Clerk à chaque requête
    this.client.interceptors.request.use(
      async (config) => {
        // Attendre que Clerk soit prêt avant chaque requête
        if (this.clerkReady) {
          await this.clerkReady;
        }

        // Seulement côté client
        if (typeof window !== 'undefined') {
          try {
            const clerk = (window as any).Clerk;
            if (clerk && clerk.session) {
              const token = await clerk.session.getToken();
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (error) {
            console.error('Error getting Clerk token:', error);
          }
        }
        return config;
      },
      (error) => {
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
