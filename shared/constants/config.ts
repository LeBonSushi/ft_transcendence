// Shared Configuration Constants
export const AppConfig = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // File uploads
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  // Chat
  MAX_MESSAGE_LENGTH: 2000,
  CHAT_HISTORY_LIMIT: 100,

  // Game
  MAX_PLAYERS_PER_GAME: 10,
  GAME_TICK_RATE: 60,
  GAME_SESSION_TIMEOUT: 3600, // 1 hour
};

export const ServicePorts = {
  AUTH: 3000,
  CHAT: 3001,
  GAME: 3002,
  USER: 3003,
};
