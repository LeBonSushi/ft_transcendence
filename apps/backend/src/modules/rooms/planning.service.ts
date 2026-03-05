import { Injectable, Inject, forwardRef, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateProposalDto,
  UpdateProposalDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto/rooms.dto';
import type { VoteType } from '@travel-planner/shared';
import { RoomsGateway } from './rooms.gateway';
import {
  PROPOSAL_WITH_VOTES_ACTIVITIES,
  VOTE_WITH_USER,
  ACTIVITY_WITH_SUGGESTER,
} from './helpers/prisma-includes';

const PROPOSAL_WITH_ROOM_MEMBERS = {
  room: {
    include: {
      members: true,
    },
  },
} as const;

@Injectable()
export class PlanningService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => RoomsGateway))
    private roomsGateway: RoomsGateway,
  ) {}

  // ─── Proposals ──────────────────────────────────────────────────────────────

  async getProposals(roomId: string) {
    return this.prisma.tripProposal.findMany({
      where: { roomId },
      include: PROPOSAL_WITH_VOTES_ACTIVITIES,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProposal(roomId: string, userId: string, data: CreateProposalDto) {
    const proposal = await this.prisma.tripProposal.create({
      data: {
        roomId,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description,
        budgetEstimate: data.budgetEstimate,
        imageUrl: data.imageUrl,
        isSelected: false,
      },
      include: PROPOSAL_WITH_VOTES_ACTIVITIES,
    });

    this.roomsGateway.emitProposalCreated(roomId, proposal);

    return proposal;
  }

  async updateProposal(proposalId: string, userId: string, data: UpdateProposalDto) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: PROPOSAL_WITH_ROOM_MEMBERS,
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const updated = await this.prisma.tripProposal.update({
      where: { id: proposalId },
      data: {
        destination: data.destination,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        description: data.description,
        budgetEstimate: data.budgetEstimate,
        imageUrl: data.imageUrl,
      },
      include: PROPOSAL_WITH_VOTES_ACTIVITIES,
    });

    this.roomsGateway.emitProposalUpdated(proposal.roomId, updated);

    return updated;
  }

  async deleteProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: PROPOSAL_WITH_ROOM_MEMBERS,
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }

    if (member.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete proposals');
    }

    const result = await this.prisma.tripProposal.delete({
      where: { id: proposalId },
    });

    this.roomsGateway.emitProposalDeleted(proposal.roomId, proposalId);

    return result;
  }

  async selectProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: PROPOSAL_WITH_ROOM_MEMBERS,
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can select a proposal');
    }

    await this.prisma.tripProposal.updateMany({
      where: { roomId: proposal.roomId, isSelected: true },
      data: { isSelected: false },
    });

    const selected = await this.prisma.tripProposal.update({
      where: { id: proposalId },
      data: { isSelected: true },
      include: PROPOSAL_WITH_VOTES_ACTIVITIES,
    });

    this.roomsGateway.emitProposalSelected(proposal.roomId, selected);

    return selected;
  }

  // ─── Votes ──────────────────────────────────────────────────────────────────

  async getVotes(proposalId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return this.prisma.tripVote.findMany({
      where: { tripProposalId: proposalId },
      include: VOTE_WITH_USER,
      orderBy: { createdAt: 'desc' },
    });
  }

  async voteOnProposal(proposalId: string, userId: string, vote: VoteType) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: PROPOSAL_WITH_ROOM_MEMBERS,
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You must be a member to vote');
    }

    const result = await this.prisma.tripVote.upsert({
      where: { tripProposalId_userId: { tripProposalId: proposalId, userId } },
      create: { tripProposalId: proposalId, userId, vote },
      update: { vote },
      include: VOTE_WITH_USER,
    });

    this.roomsGateway.emitVoteCreated(proposal.roomId, proposalId, result);

    return result;
  }

  async updateVote(proposalId: string, userId: string, vote: VoteType) {
    const existingVote = await this.prisma.tripVote.findUnique({
      where: { tripProposalId_userId: { tripProposalId: proposalId, userId } },
    });

    if (!existingVote) {
      throw new NotFoundException('Vote not found');
    }

    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
    });

    const result = await this.prisma.tripVote.update({
      where: { tripProposalId_userId: { tripProposalId: proposalId, userId } },
      data: { vote },
      include: VOTE_WITH_USER,
    });

    if (proposal) {
      this.roomsGateway.emitVoteUpdated(proposal.roomId, proposalId, result);
    }

    return result;
  }

  async deleteVote(proposalId: string, userId: string) {
    const existingVote = await this.prisma.tripVote.findUnique({
      where: { tripProposalId_userId: { tripProposalId: proposalId, userId } },
    });

    if (!existingVote) {
      throw new NotFoundException('Vote not found');
    }

    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
    });

    const result = await this.prisma.tripVote.delete({
      where: { tripProposalId_userId: { tripProposalId: proposalId, userId } },
    });

    if (proposal) {
      this.roomsGateway.emitVoteDeleted(proposal.roomId, proposalId, userId);
    }

    return result;
  }

  // ─── Activities ─────────────────────────────────────────────────────────────

  async getActivities(proposalId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return this.prisma.activitySuggestion.findMany({
      where: { tripProposalId: proposalId },
      include: ACTIVITY_WITH_SUGGESTER,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createActivity(proposalId: string, userId: string, data: CreateActivityDto) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: PROPOSAL_WITH_ROOM_MEMBERS,
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You must be a member to suggest activities');
    }

    const activity = await this.prisma.activitySuggestion.create({
      data: {
        tripProposalId: proposalId,
        suggestedById: userId,
        title: data.title,
        description: data.description ?? '',
        category: data.category,
        estimatedPrice: data.estimatedPrice,
        link: data.link,
      },
      include: ACTIVITY_WITH_SUGGESTER,
    });

    this.roomsGateway.emitActivityCreated(proposal.roomId, proposalId, activity);

    return activity;
  }

  async updateActivity(activityId: string, userId: string, data: UpdateActivityDto) {
    const activity = await this.prisma.activitySuggestion.findUnique({
      where: { id: activityId },
      include: {
        tripProposal: {
          include: { room: { include: { members: true } } },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const member = activity.tripProposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }

    if (activity.suggestedById !== userId && member.role !== 'ADMIN') {
      throw new ForbiddenException('Only the creator or an admin can edit this activity');
    }

    const updated = await this.prisma.activitySuggestion.update({
      where: { id: activityId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        estimatedPrice: data.estimatedPrice,
      },
      include: ACTIVITY_WITH_SUGGESTER,
    });

    this.roomsGateway.emitActivityUpdated(
      activity.tripProposal.roomId,
      activity.tripProposalId,
      updated,
    );

    return updated;
  }

  async deleteActivity(activityId: string, userId: string) {
    const activity = await this.prisma.activitySuggestion.findUnique({
      where: { id: activityId },
      include: {
        tripProposal: {
          include: { room: { include: { members: true } } },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const member = activity.tripProposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }

    if (activity.suggestedById !== userId && member.role !== 'ADMIN') {
      throw new ForbiddenException('Only the creator or an admin can delete this activity');
    }

    const result = await this.prisma.activitySuggestion.delete({
      where: { id: activityId },
    });

    this.roomsGateway.emitActivityDeleted(
      activity.tripProposal.roomId,
      activity.tripProposalId,
      activityId,
    );

    return result;
  }
}
