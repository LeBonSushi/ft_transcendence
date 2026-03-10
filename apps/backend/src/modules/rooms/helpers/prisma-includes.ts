/**
 * Reusable Prisma include fragments to avoid duplication across services.
 */

export const SAFE_USER_SELECT = {
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const USER_WITH_PROFILE = {
  user: {
    select: {
      ...SAFE_USER_SELECT,
      profile: true,
    },
  },
} as const;

export const MEMBERS_WITH_USER = {
  members: {
    include: {
      user: {
        select: {
          ...SAFE_USER_SELECT,
          profile: true,
        },
      },
    },
  },
} as const;

export const PROPOSAL_WITH_VOTES_ACTIVITIES = {
  votes: {
    include: {
      user: {
        select: {
          ...SAFE_USER_SELECT,
          profile: true,
        },
      },
    },
  },
  activities: true,
} as const;

export const VOTE_WITH_USER = {
  user: {
    select: {
      ...SAFE_USER_SELECT,
      profile: true,
    },
  },
} as const;

export const ACTIVITY_WITH_SUGGESTER = {
  suggestedBy: {
    select: {
      ...SAFE_USER_SELECT,
      profile: true,
    },
  },
} as const;
