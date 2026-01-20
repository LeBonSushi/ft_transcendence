'use client';

import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api';
import { useEffect } from 'react';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Configure le token getter pour l'API client
    apiClient.setTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
