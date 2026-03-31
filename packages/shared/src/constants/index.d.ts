export declare const SOCKET_EVENTS: {
    readonly CONNECTION: "connection";
    readonly DISCONNECT: "disconnect";
    readonly MESSAGE_SEND: "message:send";
    readonly MESSAGE_RECEIVE: "message:receive";
    readonly TYPING_START: "typing:start";
    readonly TYPING_STOP: "typing:stop";
    readonly ROOM_JOIN: "room:join";
    readonly ROOM_LEAVE: "room:leave";
    readonly ROOM_UPDATE: "room:update";
    readonly NOTIFICATION_NEW: "notification:new";
    readonly NOTIFICATION_UNREAD: "notification:unread";
    readonly NOTIFICATION_SUBSCRIBE: "notification:subscribe";
    readonly NOTIFICATION_ANSWER: "notification:answer";
    readonly NOTIFICATION_READ: "notification:read";
    readonly ROOM_SUBSCRIBE: "room:subscribe";
    readonly ROOM_UNSUBSCRIBE: "room:unsubscribe";
    readonly ROOM_CREATED: "room:created";
    readonly ROOM_UPDATED: "room:updated";
    readonly ROOM_LAST_MESSAGE_UPDATED: "room:last-message-updated";
    readonly ROOM_DELETED: "room:deleted";
    readonly ROOM_INVITED: "room:invited";
    readonly MEMBER_JOINED: "member:joined";
    readonly MEMBER_INVITED: "member:invited";
    readonly MEMBER_LEFT: "member:left";
    readonly MEMBER_KICKED: "member:kicked";
    readonly MEMBER_ROLE_UPDATED: "member:role_updated";
    readonly AVAILABILITY_CREATED: "availability:created";
    readonly AVAILABILITY_UPDATED: "availability:updated";
    readonly AVAILABILITY_DELETED: "availability:deleted";
    readonly PROPOSAL_CREATED: "proposal:created";
    readonly PROPOSAL_UPDATED: "proposal:updated";
    readonly PROPOSAL_DELETED: "proposal:deleted";
    readonly PROPOSAL_SELECTED: "proposal:selected";
    readonly VOTE_CREATED: "vote:created";
    readonly VOTE_UPDATED: "vote:updated";
    readonly VOTE_DELETED: "vote:deleted";
    readonly ACTIVITY_CREATED: "activity:created";
    readonly ACTIVITY_UPDATED: "activity:updated";
    readonly ACTIVITY_DELETED: "activity:deleted";
    readonly USER_ONLINE: "user:online";
    readonly USER_OFFLINE: "user:offline";
    readonly NOTIFICATION: "notification";
};
export declare const API_ROUTES: {
    readonly AUTH: {
        readonly REGISTER: "/auth/register";
        readonly LOGIN: "/auth/login";
        readonly LOGOUT: "/auth/logout";
        readonly ME: "/auth/me";
        readonly GOOGLE: "/auth/google";
        readonly GITHUB: "/auth/github";
        readonly FORGOT_PASSWORD: "/auth/forgot-password";
        readonly RESET_PASSWORD: "/auth/reset-password";
    };
    readonly USERS: {
        readonly ME: "/users/me";
        readonly SEARCH: (query: string) => string;
        readonly GET: (id: string) => string;
        readonly UPDATE: (id: string) => string;
        readonly ROOMS: (id: string) => string;
        readonly FRIENDS: (id: string) => string;
    };
    readonly FRIENDS: {
        readonly REQUESTS: "/friends/request";
        readonly RELATIONS: "/friends/relations";
        readonly SEND: (userId: string) => string;
        readonly ACCEPT: (friendshipId: string) => string;
        readonly REJECT: (friendshipId: string) => string;
        readonly DELETE: (friendshipId: string) => string;
        readonly BLOCK: (friendshipId: string) => string;
        readonly UNBLOCK: (friendshipId: string) => string;
    };
    readonly ROOMS: {
        readonly CREATE: "/rooms";
        readonly GET: (id: string) => string;
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
        readonly JOIN: (id: string) => string;
        readonly LEAVE: (id: string) => string;
        readonly MEMBERS: (id: string) => string;
        readonly UPDATE_ROLE: (roomId: string, userId: string) => string;
        readonly KICK: (roomId: string, userId: string) => string;
    };
    readonly AVAILABILITY: {
        readonly LIST: (roomId: string) => string;
        readonly CREATE: (roomId: string) => string;
        readonly UPDATE: (roomId: string, id: string) => string;
        readonly DELETE: (roomId: string, id: string) => string;
        readonly MATCHING_DATE: (roomId: string) => string;
    };
    readonly PROPOSALS: {
        readonly LIST: (roomId: string) => string;
        readonly CREATE: (roomId: string) => string;
        readonly UPDATE: (roomId: string, id: string) => string;
        readonly DELETE: (roomId: string, id: string) => string;
        readonly SELECT: (roomId: string, id: string) => string;
    };
    readonly VOTES: {
        readonly LIST: (roomId: string, proposalId: string) => string;
        readonly VOTE: (roomId: string, proposalId: string) => string;
        readonly UPDATE: (roomId: string, proposalId: string) => string;
        readonly DELETE: (roomId: string, proposalId: string) => string;
    };
    readonly ACTIVITIES: {
        readonly LIST: (roomId: string, proposalId: string) => string;
        readonly CREATE: (roomId: string, proposalId: string) => string;
        readonly UPDATE: (roomId: string, proposalId: string, id: string) => string;
        readonly DELETE: (roomId: string, proposalId: string, id: string) => string;
    };
    readonly MESSAGES: {
        readonly LIST: (roomId: string) => string;
        readonly CREATE: (roomId: string) => string;
        readonly DELETE: (roomId: string, id: string) => string;
    };
    readonly STORAGE: {
        readonly REMOVE: {
            readonly PROFILE_PICTURE: "/storage/remove/profile-picture";
        };
        readonly UPLOAD: {
            readonly PROFILE_PICTURE: "/storage/upload/profile-picture";
            readonly ROOM_IMAGE: "/storage/upload/room-image";
            readonly MESSAGE_ATTACHMENT: "/storage/upload/message-attachment";
        };
    };
};
//# sourceMappingURL=index.d.ts.map