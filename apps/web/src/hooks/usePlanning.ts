'use client';

import { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '@/lib/api';
import { useRoomSocket } from './useRoomSocket';
import type {
  TripProposalWithVotesAndActivities,
  UserAvailabilityWithUser,
  RoomMemberWithUser,
  CreateProposalDto,
  CreateVoteDto,
  CreateActivityDto,
  CreateAvailabilityDto,
  VoteType,
} from '@travel-planner/shared';

export function usePlanning(roomId: string | null, roomType?: 'GROUP' | 'DIRECT_MESSAGE' | null) {
  const [proposals, setProposals] = useState<TripProposalWithVotesAndActivities[]>([]);
  const [availabilities, setAvailabilities] = useState<UserAvailabilityWithUser[]>([]);
  const [members, setMembers] = useState<RoomMemberWithUser[]>([]);
  const [matchingDate, setMatchingDate] = useState<{ 
    startDate: Date; 
    endDate: Date; 
    duration: number;
    matchUser: number;
    droppedUser: string[];
  } | null>(null);
  const [matchingDateMessage, setMatchingDateMessage] = useState<string | null>(null);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const isDirectMessage = roomType === 'DIRECT_MESSAGE';

  const fetchProposals = useCallback(async () => {
    if (!roomId || isDirectMessage) {
      setProposals([]);
      return;
    }
    setLoadingProposals(true);
    try {
      const data = await roomsApi.getRoom(roomId).getProposals();
      setProposals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProposals(false);
    }
  }, [roomId, isDirectMessage]);

  const fetchAvailabilities = useCallback(async () => {
    if (!roomId || isDirectMessage) {
      setAvailabilities([]);
      setMatchingDate(null);
      setMatchingDateMessage(null);
      return;
    }
    setLoadingAvailabilities(true);
    try {
      const data = await roomsApi.getRoom(roomId).getAvailabilities();
      setAvailabilities(data);
      const matching = await roomsApi.getRoom(roomId).getMatchingDate();
      setMatchingDate(matching);
      setMatchingDateMessage(null);
    } catch (e) {
      setMatchingDate(null);
      const backendMessage = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;

      const message = Array.isArray(backendMessage)
        ? backendMessage.join(' ')
        : backendMessage;

      if (typeof message === 'string') {
        const normalizedMessage = message.toLowerCase();
        if (normalizedMessage.includes('minimum of 2 person')) {
          setMatchingDateMessage('Not enough users to calculate a matching date yet.');
        } else {
          setMatchingDateMessage(message);
        }
      } else {
        setMatchingDateMessage('Unable to calculate a matching date right now.');
      }
      console.error("Erreur: ", e);
    } finally {
      setLoadingAvailabilities(false);
    }
  }, [roomId, isDirectMessage]);

  useEffect(() => {
    if (!roomId) {
      setProposals([]);
      setAvailabilities([]);
      setMembers([]);
      setMatchingDate(null);
      setMatchingDateMessage(null);
      return;
    }

    if (isDirectMessage) {
      setProposals([]);
      setAvailabilities([]);
      setMatchingDate(null);
      setMatchingDateMessage(null);
      setMembers([]);
      return;
    }

    fetchProposals();
    fetchAvailabilities();
    roomsApi.getRoom(roomId).getMembers().then(setMembers).catch(console.error);
  }, [roomId, isDirectMessage, fetchProposals, fetchAvailabilities]);

  // Sync members list via socket events
  useRoomSocket(roomId, {
    onMemberJoined: ({ member }) => {
      setMembers(prev => prev.some(m => m.id === member.id) ? prev : [...prev, member as RoomMemberWithUser]);
    },
    onMemberInvited: ({ member }) => {
      setMembers(prev => prev.some(m => m.id === member.id) ? prev : [...prev, member as RoomMemberWithUser]);
    },
    onMemberLeft: ({ userId }) => {
      setMembers(prev => prev.filter(m => m.userId !== userId));
    },
    onMemberKicked: ({ userId }) => {
      setMembers(prev => prev.filter(m => m.userId !== userId));
    },
    onMemberRoleUpdated: ({ member }) => {
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, ...member } : m));
    },
  });

  const createProposal = async (data: CreateProposalDto) => {
    if (!roomId || isDirectMessage) return;
    const proposal = await roomsApi.getRoom(roomId).createProposal(data);
    await fetchProposals();
    return proposal;
  };

  const deleteProposal = async (proposalId: string) => {
    if (!roomId || isDirectMessage) return;
    await roomsApi.getRoom(roomId).proposal(proposalId).delete();
    setProposals(prev => prev.filter(p => p.id !== proposalId));
  };

  const selectProposal = async (proposalId: string) => {
    if (!roomId || isDirectMessage) return;
    await roomsApi.getRoom(roomId).proposal(proposalId).select();
    setProposals(prev => prev.map(p => ({ ...p, isSelected: p.id === proposalId })));
  };

  const vote = async (proposalId: string, voteType: VoteType, existingVote?: VoteType) => {
    if (!roomId || isDirectMessage) return;
    const api = roomsApi.getRoom(roomId).proposal(proposalId);
    if (existingVote) {
      await api.updateVote({ vote: voteType });
    } else {
      await api.vote({ vote: voteType });
    }
    await fetchProposals();
  };

  const removeVote = async (proposalId: string) => {
    if (!roomId || isDirectMessage) return;
    await roomsApi.getRoom(roomId).proposal(proposalId).deleteVote();
    await fetchProposals();
  };

  const createActivity = async (proposalId: string, data: CreateActivityDto) => {
    if (!roomId || isDirectMessage) return;
    const activity = await roomsApi.getRoom(roomId).proposal(proposalId).createActivity(data);
    await fetchProposals();
    return activity;
  };

  const deleteActivity = async (proposalId: string, activityId: string) => {
    if (!roomId || isDirectMessage) return;
    await roomsApi.getRoom(roomId).proposal(proposalId).deleteActivity(activityId);
    setProposals(prev => prev.map(p =>
      p.id === proposalId ? { ...p, activities: p.activities.filter(a => a.id !== activityId) } : p
    ));
  };

  const createAvailability = async (data: CreateAvailabilityDto) => {
    if (!roomId || isDirectMessage) return;
    const av = await roomsApi.getRoom(roomId).createAvailability(data);
    await fetchAvailabilities();
    return av;
  };

  const deleteAvailability = async (id: string) => {
    if (!roomId || isDirectMessage) return;
    await roomsApi.getRoom(roomId).deleteAvailability(id);
    await fetchAvailabilities();
  };

  return {
    proposals,
    availabilities,
    matchingDate,
    matchingDateMessage,
    members,
    loadingProposals,
    loadingAvailabilities,
    createProposal,
    deleteProposal,
    selectProposal,
    vote,
    removeVote,
    createActivity,
    deleteActivity,
    createAvailability,
    deleteAvailability,
    refetchProposals: fetchProposals,
    refetchAvailabilities: fetchAvailabilities,
  };
}
