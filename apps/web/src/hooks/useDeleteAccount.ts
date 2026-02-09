import { useState } from 'react';

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
  expectedText = 'SUPPRIMER',
  redirectUrl = '/',
}: UseDeleteAccountOptions = {}): UseDeleteAccountReturn {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === expectedText;

  // TODO: Implement delete account logic with your auth system
  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      // TODO: Call your API to delete the account
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
