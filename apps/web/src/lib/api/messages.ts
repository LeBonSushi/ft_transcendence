import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Message } from '@travel-planner/shared';

export interface CreateMessageDto {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'SYSTEM';
  attachmentUrl?: string;
}

export const messagesApi = {
  getMessages: async (roomId: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = `${API_ROUTES.MESSAGES.LIST(roomId)}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<Message[]>(url);
  },

  sendMessage: async (roomId: string, data: CreateMessageDto) => {
    return apiClient.post<Message>(API_ROUTES.MESSAGES.CREATE(roomId), data);
  },

  deleteMessage: async (roomId: string, messageId: string) => {
    return apiClient.delete(API_ROUTES.MESSAGES.DELETE(roomId, messageId));
  },
};
