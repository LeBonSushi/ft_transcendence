import { useState } from 'react';

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
}

interface UseProfileEditOptions {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    update: (data: Record<string, string>) => Promise<void>;
  };
  onSuccess?: () => void;
}

interface UseProfileEditReturn {
  isEditing: boolean;
  isSaving: boolean;
  error: string | null;
  formData: ProfileData;
  setFormData: {
    firstName: (value: string) => void;
    lastName: (value: string) => void;
    username: (value: string) => void;
  };
  startEditing: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

/**
 * Hook pour gérer l'édition du profil utilisateur
 * Gère le state du formulaire, la sauvegarde et l'annulation
 */
export function useProfileEdit({ user, onSuccess }: UseProfileEditOptions): UseProfileEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');

  const startEditing = () => setIsEditing(true);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updateData: Record<string, string> = {};
      if (firstName !== user.firstName) updateData.firstName = firstName;
      if (lastName !== user.lastName) updateData.lastName = lastName;
      if (username !== user.username && username) updateData.username = username;

      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
      }

      setIsEditing(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.longMessage
        || err?.errors?.[0]?.message
        || err?.message
        || 'Erreur lors de la mise à jour';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setUsername(user.username || '');
    setError(null);
    setIsEditing(false);
  };

  return {
    isEditing,
    isSaving,
    error,
    formData: { firstName, lastName, username },
    setFormData: {
      firstName: setFirstName,
      lastName: setLastName,
      username: setUsername,
    },
    startEditing,
    handleSave,
    handleCancel,
  };
}
