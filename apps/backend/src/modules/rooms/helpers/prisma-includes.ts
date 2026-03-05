/**
 * Reusable Prisma include fragments to avoid duplication across services.
 */

export const USER_WITH_PROFILE = {
  user: {
    include: {
      profile: true,
    },
  },
} as const;

export const MEMBERS_WITH_USER = {
  members: {
    include: {
      user: {
        include: {
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
        include: {
          profile: true,
        },
      },
    },
  },
  activities: true,
} as const;

export const VOTE_WITH_USER = {
  user: {
    include: {
      profile: true,
    },
  },
} as const;

export const ACTIVITY_WITH_SUGGESTER = {
  suggestedBy: {
    include: {
      profile: true,
    },
  },
} as const;
