'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/stores/useUserStore';
import { usersApi } from '@/lib/api';

/**
 * UserProvider - Initializes and syncs user data from backend to Zustand store
 * Loads user data when authenticated and keeps store in sync
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { setUser, setLoading, setError, clearUser } = useUserStore();

  useEffect(() => {
    const loadUserData = async () => {
      if (status === 'loading') {
        setLoading(true);
        return;
      }

      if (status === 'unauthenticated') {
        clearUser();
        return;
      }

      if (status === 'authenticated') {
        try {
          setLoading(true);
          const userData = await usersApi.getCurrentUser().getProfile();
          setUser(userData);
        } catch (error: any) {
          console.error('Failed to load user data:', error);
          setError(error?.message || 'Failed to load user data');
        }
      }
    };

    loadUserData();
  }, [status, setUser, setLoading, setError, clearUser]);

  return <>{children}</>;
}
