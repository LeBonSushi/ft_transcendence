import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import { useUserStore } from '@/stores/useUserStore';

export interface UploadResponse {
  url: string;
  key: string;
}

export const storageApi = {

  removeProfilePicture: async () => {
    const result = await apiClient.delete(API_ROUTES.STORAGE.REMOVE.PROFILE_PICTURE);
    
    // Update Zustand store immediately
    const { updateProfile } = useUserStore.getState();
    updateProfile({ profilePicture: undefined });
    
    return result;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>(
      API_ROUTES.STORAGE.UPLOAD.PROFILE_PICTURE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Update Zustand store immediately
    const { updateProfile } = useUserStore.getState();
    updateProfile({ profilePicture: response.url });
    
    return response;
  },

  uploadRoomImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<UploadResponse>(
      API_ROUTES.STORAGE.UPLOAD.ROOM_IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  uploadMessageAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<UploadResponse>(
      API_ROUTES.STORAGE.UPLOAD.MESSAGE_ATTACHMENT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};
