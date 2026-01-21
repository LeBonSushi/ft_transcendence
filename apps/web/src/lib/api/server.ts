import 'server-only';
import { auth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper pour créer un client fetch avec auth Clerk serveur
async function createServerFetch() {
  const { getToken } = await auth();
  const token = await getToken();

  return async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };
}

// API Client côté serveur - UNIQUEMENT pour Server Components
export class ServerApiClient {
  private fetchWithAuth: Awaited<ReturnType<typeof createServerFetch>> | null = null;

  private async ensureFetch() {
    if (!this.fetchWithAuth) {
      this.fetchWithAuth = await createServerFetch();
    }
    return this.fetchWithAuth;
  }

  async get<T>(url: string, config = {}) {
    const fetch = await this.ensureFetch();
    return fetch<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config = {}) {
    const fetch = await this.ensureFetch();
    return fetch<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config = {}) {
    const fetch = await this.ensureFetch();
    return fetch<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, config = {}) {
    const fetch = await this.ensureFetch();
    return fetch<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config = {}) {
    const fetch = await this.ensureFetch();
    return fetch<T>(url, { method: 'DELETE' });
  }
}

// Export une instance pour Server Components
export const serverApiClient = new ServerApiClient();
