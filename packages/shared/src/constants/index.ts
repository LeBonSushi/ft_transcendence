export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_UPDATE: 'room:update',

  // Room gateway events
  ROOM_SUBSCRIBE: 'room:subscribe',
  ROOM_UNSUBSCRIBE: 'room:unsubscribe',
  ROOM_CREATED: 'room:created',
  ROOM_UPDATED: 'room:updated',
  ROOM_DELETED: 'room:deleted',

  MEMBER_JOINED: 'member:joined',
  MEMBER_INVITED: 'member:invited',
  MEMBER_LEFT: 'member:left',
  MEMBER_KICKED: 'member:kicked',
  MEMBER_ROLE_UPDATED: 'member:role_updated',

  AVAILABILITY_CREATED: 'availability:created',
  AVAILABILITY_UPDATED: 'availability:updated',
  AVAILABILITY_DELETED: 'availability:deleted',

  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_UPDATED: 'proposal:updated',
  PROPOSAL_DELETED: 'proposal:deleted',
  PROPOSAL_SELECTED: 'proposal:selected',

  VOTE_CREATED: 'vote:created',
  VOTE_UPDATED: 'vote:updated',
  VOTE_DELETED: 'vote:deleted',

  ACTIVITY_CREATED: 'activity:created',
  ACTIVITY_UPDATED: 'activity:updated',
  ACTIVITY_DELETED: 'activity:deleted',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  NOTIFICATION: 'notification',
} as const;

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
    FORTY_TWO: '/auth/42',
  },

  USERS: {
    ME: '/users/me',
    ME_ROOMS: '/users/me/rooms',
    GET_CURRENT: '/users/me',
    SEARCH: (query: string) =>`/users/search?query=${query}`,
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    ROOMS: (id: string) => `/users/${id}/rooms`,
    FRIENDS: (id: string) => `/users/${id}/friends`,
  },

  FRIENDS: {
    REQUESTS: '/friends/requests',
    SEND: (userId: string) => `/friends/request/${userId}`,
    ACCEPT: (friendshipId: string) => `/friends/accept/${friendshipId}`,
    REJECT: (friendshipId: string) => `/friends/reject/${friendshipId}`,
    DELETE: (friendshipId: string) => `/friends/${friendshipId}`,
    BLOCK: (friendshipId: string) => `/friends/block/${friendshipId}`,
    UNBLOCK: (friendshipId: string) => `/friends/unblock/${friendshipId}`,
  },

  ROOMS: {
    CREATE: '/rooms',
    GET: (id: string) => `/rooms/${id}`,
    UPDATE: (id: string) => `/rooms/${id}`,
    DELETE: (id: string) => `/rooms/${id}`,
    JOIN: (id: string) => `/rooms/${id}/join`,
    LEAVE: (id: string) => `/rooms/${id}/leave`,
    MEMBERS: (id: string) => `/rooms/${id}/members`,
    UPDATE_ROLE: (roomId: string, userId: string) => `/rooms/${roomId}/members/${userId}/role`,
    KICK: (roomId: string, userId: string) => `/rooms/${roomId}/members/${userId}`,
  },

  AVAILABILITY: {
    LIST: (roomId: string) => `/rooms/${roomId}/availability`,
    CREATE: (roomId: string) => `/rooms/${roomId}/availability`,
    UPDATE: (roomId: string, id: string) => `/rooms/${roomId}/availability/${id}`,
    DELETE: (roomId: string, id: string) => `/rooms/${roomId}/availability/${id}`,
  },

  PROPOSALS: {
    LIST: (roomId: string) => `/rooms/${roomId}/proposals`,
    CREATE: (roomId: string) => `/rooms/${roomId}/proposals`,
    UPDATE: (roomId: string, id: string) => `/rooms/${roomId}/proposals/${id}`,
    DELETE: (roomId: string, id: string) => `/rooms/${roomId}/proposals/${id}`,
    SELECT: (roomId: string, id: string) => `/rooms/${roomId}/proposals/${id}/select`,
  },

  VOTES: {
    LIST: (roomId: string, proposalId: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/votes`,
    VOTE: (roomId: string, proposalId: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/vote`,
    UPDATE: (roomId: string, proposalId: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/vote`,
    DELETE: (roomId: string, proposalId: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/vote`,
  },

  ACTIVITIES: {
    LIST: (roomId: string, proposalId: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/activities`,
    CREATE: (roomId: string, proposalId: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/activities`,
    UPDATE: (roomId: string, proposalId: string, id: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/activities/${id}`,
    DELETE: (roomId: string, proposalId: string, id: string) =>
      `/rooms/${roomId}/proposals/${proposalId}/activities/${id}`,
  },

  MESSAGES: {
    LIST: (roomId: string) => `/rooms/${roomId}/messages`,
    CREATE: (roomId: string) => `/rooms/${roomId}/messages`,
    DELETE: (roomId: string, id: string) => `/rooms/${roomId}/messages/${id}`,
  },

  STORAGE: {
    REMOVE: {
      PROFILE_PICTURE: '/storage/remove/profile-picture',
    },
    UPLOAD: {
      PROFILE_PICTURE: '/storage/upload/profile-picture',
      ROOM_IMAGE: '/storage/upload/room-image',
      MESSAGE_ATTACHMENT: '/storage/upload/message-attachment',
    },
  },
} as const;
