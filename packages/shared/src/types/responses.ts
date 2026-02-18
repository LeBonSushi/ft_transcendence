import { Room, RoomMember, UserAvailability, TripProposal, TripVote, ActivitySuggestion } from './room';
import { User, Profile } from './user';

// Types pour les réponses avec les relations Prisma

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface RoomMemberWithUser extends RoomMember {
  user: UserWithProfile;
}

export interface TripProposalWithRelations extends TripProposal {
  votes: TripVote[];
  activities: ActivitySuggestion[];
}

export interface RoomWithCreator extends Room {
  creator: UserWithProfile;
}

export interface RoomWithMembers extends Room {
  members: RoomMemberWithUser[];
}

export interface RoomWithDetails extends Room {
  creator: UserWithProfile;
  members: RoomMemberWithUser[];
  tripProposals: TripProposalWithRelations[];
}

export interface UserAvailabilityWithUser extends UserAvailability {
  user: UserWithProfile;
}

export interface TripVoteWithUser extends TripVote {
  user: UserWithProfile;
}

export interface ActivitySuggestionWithUser extends ActivitySuggestion {
  suggestedBy?: UserWithProfile;
}

export interface TripProposalWithVotesAndActivities extends TripProposal {
  votes: TripVoteWithUser[];
  activities: ActivitySuggestion[];
}

