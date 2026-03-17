import { signOut as nextAuthSignOut } from 'next-auth/react';
import { apiClient } from '@/lib/api';
import { useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';

interface UseDeleteAccountOptions {
  expectedText?: string;
  redirectUrl?: string;
}

interface UseDeleteAccountReturn {
  confirmText: string;
  setConfirmText: (value: string) => void;
  isDeleting: boolean;
  error: string | null;
  canDelete: boolean;
  handleDelete: () => Promise<void>;
}

/**
 * Hook pour gérer la suppression de compte
 * Gère la confirmation par texte et la suppression
 */
export function useDeleteAccount({
  expectedText = 'DELETE',
  redirectUrl = '/signin?deleted=1',
}: UseDeleteAccountOptions = {}): UseDeleteAccountReturn {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearUser = useUserStore((state) => state.clearUser);

  const canDelete = confirmText === expectedText;

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete('/users/me');
      apiClient.setToken(null);
      clearUser();

      await nextAuthSignOut({ redirect: false });
      window.location.replace(redirectUrl);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Error while deleting your account'
      );
      setIsDeleting(false);
    }
  };

  return {
    confirmText,
    setConfirmText,
    isDeleting,
    error,
    canDelete,
    handleDelete,
  };
}
