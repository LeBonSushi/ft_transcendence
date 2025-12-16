import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';

export interface UploadResponse {
  url: string;
  key: string;
}

export const storageApi = {
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<UploadResponse>(
      API_ROUTES.STORAGE.UPLOAD.PROFILE_PICTURE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
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
