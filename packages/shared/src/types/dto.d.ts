import { VoteType, MemberRole } from './room';
export interface CreateRoomDto {
    name: string;
    type: 'GROUP' | 'DIRECT_MESSAGE';
    invitedUserId?: string;
    description?: string;
    isPrivate?: boolean;
}
export interface UpdateRoomDto {
    name?: string;
    description?: string;
    imageUrl?: string;
}
export interface UpdateRoleDto {
    role: MemberRole;
}
export interface CreateAvailabilityDto {
    startDate: string;
    endDate: string;
    notes?: string;
}
export interface UpdateAvailabilityDto {
    startDate?: string;
    endDate?: string;
    notes?: string;
}
export interface CreateProposalDto {
    destination: string;
    startDate: string;
    endDate: string;
    budgetEstimate?: number;
    description: string;
    imageUrl?: string;
}
export interface UpdateProposalDto {
    destination?: string;
    startDate?: string;
    endDate?: string;
    budgetEstimate?: number;
    description?: string;
    imageUrl?: string;
}
export interface CreateActivityDto {
    title: string;
    description?: string;
    category: 'RESTAURANT' | 'MUSEUM' | 'NIGHTLIFE' | 'OUTDOOR' | 'OTHER';
    estimatedPrice?: number;
    link?: string;
}
export interface UpdateActivityDto {
    title?: string;
    description?: string;
    category?: 'RESTAURANT' | 'MUSEUM' | 'NIGHTLIFE' | 'OUTDOOR' | 'OTHER';
    estimatedPrice?: number;
    link?: string;
}
export interface CreateVoteDto {
    vote: VoteType;
}
export interface SendFriendRequestDto {
    friendId: string;
}
export interface UpdateFriendRequestDto {
    status: 'ACCEPTED' | 'BLOCKED';
}
export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    birthdate?: string;
    profilePicture?: string;
}
//# sourceMappingURL=dto.d.ts.map