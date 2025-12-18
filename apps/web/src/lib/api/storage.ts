import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';

export interface UploadResponse {
  url: string;
  key: string;
}

/**
 * Storage API methods
 *
 * Handles file uploads to S3-compatible storage including
 * profile pictures, room images, and message attachments.
 */
export const storageApi = {
  /**
   * Uploads a profile picture
   *
   * Uploads an image file to be used as a user's profile picture.
   * The file is stored in S3 and returns a public URL.
   *
   * @param file - Image file to upload (JPG, PNG, etc.)
   * @returns Promise with upload response containing URL and storage key
   */
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

  /**
   * Uploads a room image
   *
   * Uploads an image file to be used as a room's cover/banner image.
   * The file is stored in S3 and returns a public URL.
   *
   * @param file - Image file to upload (JPG, PNG, etc.)
   * @returns Promise with upload response containing URL and storage key
   */
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

  /**
   * Uploads a message attachment
   *
   * Uploads a file to be attached to a chat message.
   * Supports images, documents, and other file types.
   * The file is stored in S3 and returns a public URL.
   *
   * @param file - File to upload
   * @returns Promise with upload response containing URL and storage key
   */
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
