import { useState } from 'react';
import { useUser, useReverification } from '@clerk/nextjs';

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
 * Gère la confirmation par texte, la révérification et la suppression
 */
export function useDeleteAccount({
  expectedText = 'SUPPRIMER',
  redirectUrl = '/',
}: UseDeleteAccountOptions = {}): UseDeleteAccountReturn {
  const { user } = useUser();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === expectedText;

  const deleteAccount = async () => {
    await user?.delete();
  };

  const deleteWithReverification = useReverification(deleteAccount);

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteWithReverification();
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la suppression du compte'
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
