import { create } from 'zustand';
import type { User } from '@travel-planner/shared';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: Partial<User['profile']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  
  setUser: (user) => set({ user, isLoading: false, error: null }),
  
  updateUser: (updates) => 
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  
  updateProfile: (updates) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            profile: state.user.profile
              ? { ...state.user.profile, ...updates }
              : updates as any,
          }
        : null,
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearUser: () => set({ user: null, isLoading: false, error: null }),
}));
