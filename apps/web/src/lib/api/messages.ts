import { apiClient } from './client';
import { API_ROUTES } from '@travel-planner/shared';
import type { Message } from '@travel-planner/shared';

export interface CreateMessageDto {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'SYSTEM';
  attachmentUrl?: string;
}

/**
 * Messages API methods
 *
 * Handles chat message operations including sending, retrieving,
 * and deleting messages in room conversations.
 */
export const messagesApi = {
  /**
   * Gets messages for a room
   *
   * Fetches chat messages from a room's conversation history.
   * Supports pagination with limit and offset parameters.
   *
   * @param roomId - The room's unique identifier
   * @param limit - Maximum number of messages to fetch
   * @param offset - Number of messages to skip (for pagination)
   * @returns Promise with array of messages
   */
  getMessages: async (roomId: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const url = `${API_ROUTES.MESSAGES.LIST(roomId)}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<Message[]>(url);
  },

  /**
   * Sends a message to a room
   *
   * Creates and sends a new message in the room's chat.
   * Supports text messages, images, and system notifications.
   *
   * @param roomId - The room's unique identifier
   * @param data - Message data (content, type, optional attachment)
   * @returns Promise with created message data
   */
  sendMessage: async (roomId: string, data: CreateMessageDto) => {
    return apiClient.post<Message>(API_ROUTES.MESSAGES.CREATE(roomId), data);
  },

  /**
   * Deletes a message
   *
   * Removes a message from the room's chat history.
   * Only the message author or room admins can delete messages.
   *
   * @param roomId - The room's unique identifier
   * @param messageId - The message's unique identifier
   * @returns Promise that resolves when deletion is complete
   */
  deleteMessage: async (roomId: string, messageId: string) => {
    return apiClient.delete(API_ROUTES.MESSAGES.DELETE(roomId, messageId));
  },
};
