import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useUserStore } from '@/stores/useUserStore';

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
}

interface UseProfileEditOptions {
  user: {
    id: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    username?: string | null;
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
  
  const { updateUser, updateProfile } = useUserStore();

  const [firstName, setFirstName] = useState(user.profile?.firstName || '');
  const [lastName, setLastName] = useState(user.profile?.lastName || '');
  const [username, setUsername] = useState(user.username || '');

  useEffect(() => {
    setFirstName(user.profile?.firstName || '');
    setLastName(user.profile?.lastName || '');
    setUsername(user.username || '');
  }, [user]);

  const startEditing = () => setIsEditing(true);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updateData: Record<string, string> = {};
      if (firstName !== (user.profile?.firstName || '')) updateData.firstName = firstName;
      if (lastName !== (user.profile?.lastName || '')) updateData.lastName = lastName;
      if (username !== user.username && username) updateData.username = username;

      if (Object.keys(updateData).length > 0) {
        const response = await usersApi.updateUser(user.id, updateData);
        
        // Update Zustand store immediately with the response
        if (response.user) {
          const { user: updatedUser } = response;
          
          // Update user-level fields
          if (updatedUser.username) updateUser({ username: updatedUser.username });
          if (updatedUser.email) updateUser({ email: updatedUser.email });
          
          // Update profile fields
          if (updatedUser.profile) {
            updateProfile({
              firstName: updatedUser.profile.firstName,
              lastName: updatedUser.profile.lastName,
            });
          }
        }
      }

      setIsEditing(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message
        || err?.message
        || 'Erreur lors de la mise à jour';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.profile?.firstName || '');
    setLastName(user.profile?.lastName || '');
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
