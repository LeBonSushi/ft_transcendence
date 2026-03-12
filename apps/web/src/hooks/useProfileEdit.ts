import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { useUserStore } from '@/stores/useUserStore';

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface UseProfileEditOptions {
  user: {
    id: string;
    username?: string | null;
    email?: string | null;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  };
  onSuccess?: () => void;
}

interface UseProfileEditReturn {
  isEditing: boolean;
  isSaving: boolean;
  error: string | null;
  warning: string | null;
  formData: ProfileData;
  setFormData: {
    firstName: (value: string) => void;
    lastName: (value: string) => void;
    username: (value: string) => void;
    email: (value: string) => void;
    password: (value: string) => void;
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
  const [warning, setWarning] = useState<string | null>(null);
  
  const { updateUser, updateProfile } = useUserStore();

  const [firstName, setFirstName] = useState(user.profile?.firstName || '');
  const [lastName, setLastName] = useState(user.profile?.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setFirstName(user.profile?.firstName || '');
    setLastName(user.profile?.lastName || '');
    setUsername(user.username || '');
    setEmail(user.email || '');
    setPassword('');
  }, [user]);

  useEffect(() => {
    if (!error) return;

    const timeoutId = window.setTimeout(() => {
      setError(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [error]);

  useEffect(() => {
    if (!warning) return;

    const timeoutId = window.setTimeout(() => {
      setWarning(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [warning]);

  const normalizeMessages = (value: unknown): string[] => {
    if (!value) return [];
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => normalizeMessages(item))
        .filter((message) => message.trim().length > 0);
    }
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>)
        .flatMap((item) => normalizeMessages(item))
        .filter((message) => message.trim().length > 0);
    }
    return [];
  };

  const getBackendMessages = (err: any): string[] => {
    const data = err?.response?.data;
    const messages = [
      ...normalizeMessages(data?.warnings),
      ...normalizeMessages(data?.message),
      ...normalizeMessages(data?.errors),
    ];

    return Array.from(new Set(messages));
  };

  const getUpdateErrorMessage = (err: any) => {
    const status = err?.response?.status;
    const backendMessages = getBackendMessages(err);

    if (backendMessages.length > 0) {
      return backendMessages.join('\n');
    }

    if (status === 400 || status === 422) {
      return 'Invalid profile data. Please check your inputs.';
    }

    if (status === 409) {
      return 'This username is already taken.';
    }

    return 'Unable to update profile. Please try again.';
  };

  const startEditing = () => setIsEditing(true);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setWarning(null);

    try {
      const currentFirstName = user.profile?.firstName ?? '';
      const currentLastName = user.profile?.lastName ?? '';
      const currentUsername = user.username ?? '';
      const currentEmail = user.email ?? '';

      const nextFirstName = firstName.trim();
      const nextLastName = lastName.trim();
      const nextUsername = username.trim();
      const nextEmail = email.trim();
      const nextPassword = password.trim();

      const updateData: Partial<ProfileData> = {};

      if (nextFirstName !== currentFirstName)
        updateData.firstName = nextFirstName;

      if (nextLastName !== currentLastName)
        updateData.lastName = nextLastName;

      if (nextUsername !== currentUsername)
        updateData.username = nextUsername;

      if (nextEmail !== currentEmail)
        updateData.email = nextEmail;

      if (nextPassword.length > 0)
        updateData.password = nextPassword;

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        onSuccess?.();
        return;
      }

      const response = await usersApi.updateUser(user.id, updateData);
      const normalizedResponse = response as any;
      const updatedUser = normalizedResponse?.user ?? normalizedResponse;
      const backendWarnings = normalizeMessages(normalizedResponse?.warnings);

      if (backendWarnings.length > 0) {
        setWarning(backendWarnings.join('\n'));
      }

      if (updatedUser) {
        if (updatedUser.username)
          updateUser({ username: updatedUser.username });

        if (updatedUser.email)
          updateUser({ email: updatedUser.email });
        else if (updateData.email !== undefined)
          updateUser({ email: updateData.email });

        if (updatedUser.profile) {
          updateProfile({
            firstName: updatedUser.profile.firstName,
            lastName: updatedUser.profile.lastName,
          });
        }
      }

      setPassword('');

      setIsEditing(false);
      onSuccess?.();
    } catch (err: any) {
      setError(getUpdateErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.profile?.firstName || '');
    setLastName(user.profile?.lastName || '');
    setUsername(user.username || '');
    setEmail(user.email || '');
    setPassword('');
    setError(null);
    setWarning(null);
    setIsEditing(false);
  };

  return {
    isEditing,
    isSaving,
    error,
    warning,
    formData: { firstName, lastName, username, email, password },
    setFormData: {
      firstName: setFirstName,
      lastName: setLastName,
      username: setUsername,
      email: setEmail,
      password: setPassword,
    },
    startEditing,
    handleSave,
    handleCancel,
  };
}
