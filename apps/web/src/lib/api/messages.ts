import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Message } from '@travel-planner/shared';

export interface CreateMessageDto {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'SYSTEM';
  attachmentUrl?: string;
}

// Classe pour gérer un message spécifique
class MessageResource {
  constructor(private roomId: string, private messageId: string) {}

  async delete() {
    return apiClient.delete(API_ROUTES.MESSAGES.DELETE(this.roomId, this.messageId));
  }
}

// Classe pour gérer les messages d'une room
class RoomMessagesResource {
  constructor(private roomId: string) {}

  async getAll(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = `${API_ROUTES.MESSAGES.LIST(this.roomId)}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<Message[]>(url);
  }

  async send(data: CreateMessageDto) {
    return apiClient.post<Message>(API_ROUTES.MESSAGES.CREATE(this.roomId), data);
  }

  message(messageId: string) {
    return new MessageResource(this.roomId, messageId);
  }
}

export const messagesApi = {
  // Retourne une instance pour le chaînage
  inRoom: (roomId: string) => {
    return new RoomMessagesResource(roomId);
  },

  // Méthodes directes pour compatibilité
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
