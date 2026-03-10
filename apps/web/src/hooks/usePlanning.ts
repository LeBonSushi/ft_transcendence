'use client';

import { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '@/lib/api';
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
      return;
    }
    setLoadingAvailabilities(true);
    try {
      const data = await roomsApi.getRoom(roomId).getAvailabilities();
      setAvailabilities(data);
      // Fetch matching date after availabilities are loaded
      const matching = await roomsApi.getRoom(roomId).getMatchingDate();
      setMatchingDate(matching);
    } catch (e) {
      console.error(e);
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
      return;
    }

    if (isDirectMessage) {
      setProposals([]);
      setAvailabilities([]);
      setMatchingDate(null);
      setMembers([]);
      return;
    }

    fetchProposals();
    fetchAvailabilities();
    roomsApi.getRoom(roomId).getMembers().then(setMembers).catch(console.error);
  }, [roomId, isDirectMessage, fetchProposals, fetchAvailabilities]);

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
    setAvailabilities(prev => [...prev, av]);
    return av;
  };

  const deleteAvailability = async (id: string) => {
    if (!roomId || isDirectMessage) return;
    await roomsApi.getRoom(roomId).deleteAvailability(id);
    setAvailabilities(prev => prev.filter(a => a.id !== id));
  };

  return {
    proposals,
    availabilities,
    matchingDate,
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
