'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '@travel-planner/shared';
import type {
  Room,
  RoomMember,
  UserAvailability,
  TripProposal,
  TripVote,
  ActivitySuggestion,
} from '@travel-planner/shared';

// --- Event payload types ---

interface RoomUpdatedPayload { room: Room }
interface RoomDeletedPayload { roomId: string }

interface MemberPayload { member: RoomMember }
interface MemberLeftPayload { userId: string }
interface MemberKickedPayload { userId: string }

interface AvailabilityPayload { availability: UserAvailability }
interface AvailabilityDeletedPayload { availabilityId: string }

interface ProposalPayload { proposal: TripProposal }
interface ProposalDeletedPayload { proposalId: string }

interface VotePayload { proposalId: string; vote: TripVote }
interface VoteDeletedPayload { proposalId: string; userId: string }

interface ActivityPayload { proposalId: string; activity: ActivitySuggestion }
interface ActivityDeletedPayload { proposalId: string; activityId: string }

// --- Callbacks interface ---

export interface RoomSocketCallbacks {
  // Room
  onRoomUpdated?: (data: RoomUpdatedPayload) => void;
  onRoomDeleted?: (data: RoomDeletedPayload) => void;

  // Members
  onMemberJoined?: (data: MemberPayload) => void;
  onMemberInvited?: (data: MemberPayload) => void;
  onMemberLeft?: (data: MemberLeftPayload) => void;
  onMemberKicked?: (data: MemberKickedPayload) => void;
  onMemberRoleUpdated?: (data: MemberPayload) => void;

  // Availabilities
  onAvailabilityCreated?: (data: AvailabilityPayload) => void;
  onAvailabilityUpdated?: (data: AvailabilityPayload) => void;
  onAvailabilityDeleted?: (data: AvailabilityDeletedPayload) => void;

  // Proposals
  onProposalCreated?: (data: ProposalPayload) => void;
  onProposalUpdated?: (data: ProposalPayload) => void;
  onProposalDeleted?: (data: ProposalDeletedPayload) => void;
  onProposalSelected?: (data: ProposalPayload) => void;

  // Votes
  onVoteCreated?: (data: VotePayload) => void;
  onVoteUpdated?: (data: VotePayload) => void;
  onVoteDeleted?: (data: VoteDeletedPayload) => void;

  // Activities
  onActivityCreated?: (data: ActivityPayload) => void;
  onActivityUpdated?: (data: ActivityPayload) => void;
  onActivityDeleted?: (data: ActivityDeletedPayload) => void;
}

// --- Hook ---

export function useRoomSocket(roomId: string | null, callbacks: RoomSocketCallbacks = {}) {
  const { socket, isConnected } = useSocket();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    // Subscribe to room events
    socket.emit(SOCKET_EVENTS.ROOM_SUBSCRIBE, { roomId });

    // Map: socket event → callback key
    const eventMap: Array<[string, keyof RoomSocketCallbacks]> = [
      [SOCKET_EVENTS.ROOM_UPDATED, 'onRoomUpdated'],
      [SOCKET_EVENTS.ROOM_DELETED, 'onRoomDeleted'],
      [SOCKET_EVENTS.MEMBER_JOINED, 'onMemberJoined'],
      [SOCKET_EVENTS.MEMBER_INVITED, 'onMemberInvited'],
      [SOCKET_EVENTS.MEMBER_LEFT, 'onMemberLeft'],
      [SOCKET_EVENTS.MEMBER_KICKED, 'onMemberKicked'],
      [SOCKET_EVENTS.MEMBER_ROLE_UPDATED, 'onMemberRoleUpdated'],
      [SOCKET_EVENTS.AVAILABILITY_CREATED, 'onAvailabilityCreated'],
      [SOCKET_EVENTS.AVAILABILITY_UPDATED, 'onAvailabilityUpdated'],
      [SOCKET_EVENTS.AVAILABILITY_DELETED, 'onAvailabilityDeleted'],
      [SOCKET_EVENTS.PROPOSAL_CREATED, 'onProposalCreated'],
      [SOCKET_EVENTS.PROPOSAL_UPDATED, 'onProposalUpdated'],
      [SOCKET_EVENTS.PROPOSAL_DELETED, 'onProposalDeleted'],
      [SOCKET_EVENTS.PROPOSAL_SELECTED, 'onProposalSelected'],
      [SOCKET_EVENTS.VOTE_CREATED, 'onVoteCreated'],
      [SOCKET_EVENTS.VOTE_UPDATED, 'onVoteUpdated'],
      [SOCKET_EVENTS.VOTE_DELETED, 'onVoteDeleted'],
      [SOCKET_EVENTS.ACTIVITY_CREATED, 'onActivityCreated'],
      [SOCKET_EVENTS.ACTIVITY_UPDATED, 'onActivityUpdated'],
      [SOCKET_EVENTS.ACTIVITY_DELETED, 'onActivityDeleted'],
    ];

    // Register all listeners
    const handlers: Array<[string, (data: any) => void]> = [];

    for (const [event, callbackKey] of eventMap) {
      const handler = (data: any) => {
        callbacksRef.current[callbackKey]?.(data);
      };
      socket.on(event, handler);
      handlers.push([event, handler]);
    }

    // Cleanup
    return () => {
      socket.emit(SOCKET_EVENTS.ROOM_UNSUBSCRIBE, { roomId });
      for (const [event, handler] of handlers) {
        socket.off(event, handler);
      }
    };
  }, [socket, isConnected, roomId]);

  return { isConnected };
}
