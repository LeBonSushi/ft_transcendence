import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { 
  CreateRoomDto, 
  UpdateRoomDto, 
  CreateAvailabilityDto, 
  UpdateAvailabilityDto,
  CreateProposalDto,
  UpdateProposalDto,
  CreateActivityDto,
  UpdateActivityDto
 } from './dto/rooms.dto'
import { VoteType, ActivityCategory, MemberRole, RoomStatus } from '@travel-planner/shared';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // CRUD ROOM
  async create(userId: string, data: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        tripProposals: {
          include: {
            votes: true,
            activities: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async updateRoom(roomId: string, userId: string, data: UpdateRoomDto) {
    const room = await this.findById(roomId);

    const member = room.members.find(m => m.userId === userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }

    if (member.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update the room');
    }

    return this.prisma.room.update({
      where: {id: roomId},
      data: {
        name: data.name,
        description: data.description
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete the room');
    }

    return this.prisma.room.delete({
      where: {
        id: roomId,
      }
    })
  }

  // RoomMembers
  async joinRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    const existingMember = room.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new ForbiddenException('Already a member of this room');
    }

    return this.prisma.roomMember.create({
      data: {
        roomId,
        userId,
        role: 'MEMBER',
      },
    });
  }

  async leaveRoom(roomId: string, userId: string) {
    const member = await this.prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Not a member of this room');
    }

    if (member.role === 'ADMIN') {
      throw new ForbiddenException('Admin must transfer role before leaving');
    }

    return this.prisma.roomMember.delete({
      where: {
        id: member.id,
      },
    });
  }

  async getMembers(roomId: string) {
    await this.findById(roomId);

    return this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc', // Du plus au moins recnet
      },
    });
  }

  async updateMemberRole(
    roomId: string,
    targetUserId: string,
    role: MemberRole,
    requesterId: string
  ) {
    const room = await this.findById(roomId);
    
    const requester = room.members.find(m => m.userId === requesterId);
    if (!requester || requester.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change member roles');
    }
    
    const targetMember = room.members.find(m => m.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundException('Target user is not a member of this room');
    }
    
    if (requesterId === targetUserId && role === 'MEMBER') {
      const adminCount = room.members.filter(m => m.role === 'ADMIN').length;
      if (adminCount === 1) {
        throw new ForbiddenException('Cannot demote the last admin');
      }
    }
    
    return this.prisma.roomMember.update({
      where: { id: targetMember.id },
      data: { role },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async kickMember(
    roomId: string,
    targetUserId: string,
    requesterId: string
  ) {
    const room = await this.findById(roomId);
    
    const requester = room.members.find(m => m.userId === requesterId);
    if (!requester || requester.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can kick members');
    }
    
    const targetMember = room.members.find(m => m.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundException('Target user is not a member of this room');
    }
    
    if (requesterId === targetUserId) {
      throw new ForbiddenException('Cannot kick yourself, use leave instead');
    }
    
    return this.prisma.roomMember.delete({
      where: { id: targetMember.id },
    });
  }

  // Availabilities
  async getAvailabilities(roomId: string) {
    await this.findById(roomId);
    
    return this.prisma.userAvailability.findMany({
      where: { roomId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async createAvailability(
    roomId: string,
    userId: string,
    data: CreateAvailabilityDto
  ) {
    await this.checkMembership(roomId, userId);
    
    return this.prisma.userAvailability.create({
      data: {
        roomId,
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async updateAvailability(
    availabilityId: string,
    userId: string,
    data: UpdateAvailabilityDto
  ) {
    const availability = await this.prisma.userAvailability.findUnique({
      where: { id: availabilityId },
    });
    
    if (!availability) {
      throw new NotFoundException('Availability not found');
    }
    
    if (availability.userId !== userId) {
      throw new ForbiddenException('You can only edit your own availability');
    }
    
    return this.prisma.userAvailability.update({
      where: { id: availabilityId },
      data: {
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        notes: data.notes,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async deleteAvailability(availabilityId: string, userId: string) {
    const availability = await this.prisma.userAvailability.findUnique({
      where: { id: availabilityId },
    });
    
    if (!availability) {
      throw new NotFoundException('Availability not found');
    }
    
    if (availability.userId !== userId) {
      throw new ForbiddenException('You can only delete your own availability');
    }
    
    return this.prisma.userAvailability.delete({
      where: { id: availabilityId },
    });
  }

  // Proposal

  async getProposals(roomId: string) {
    await this.findById(roomId);
    
    return this.prisma.tripProposal.findMany({
      where: { roomId },
      include: {
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
      },
      orderBy: {
        createdAt: 'desc'
      },
    });
  }

  async createProposal(
    roomId: string,
    userId: string,
    data: CreateProposalDto
  ) {
    await this.checkMembership(roomId, userId);
    
    return this.prisma.tripProposal.create({
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
      include: {
        votes: true,
        activities: true,
      },
    });
  }

  async updateProposal(
    proposalId: string,
    userId: string,
    data: UpdateProposalDto
  ) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: {
        room: {
          include: {
            members: true,
          },
        },
      },
    });
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    
    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }
    
    
    return this.prisma.tripProposal.update({
      where: { id: proposalId },
      data: {
        destination: data.destination,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        description: data.description,
        budgetEstimate: data.budgetEstimate,
        imageUrl: data.imageUrl,
      },
      include: {
        votes: true,
        activities: true,
      },
    });
  }

  async deleteProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: {
        room: {
          include: {
            members: true,
          },
        },
      },
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
    
    return this.prisma.tripProposal.delete({
      where: { id: proposalId },
    });
  }

  async selectProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: {
        room: {
          include: {
            members: true,
          },
        },
      },
    });
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    
    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can select a proposal');
    }
    
    await this.prisma.tripProposal.updateMany({
      where: {
        roomId: proposal.roomId,
        isSelected: true,
      },
      data: {
        isSelected: false,
      },
    });
    
    return this.prisma.tripProposal.update({
      where: { id: proposalId },
      data: {
        isSelected: true,
      },
      include: {
        votes: true,
        activities: true,
      },
  })};


  // Vote
  async getVotes(proposalId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
    });
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    
    return this.prisma.tripVote.findMany({
      where: { tripProposalId: proposalId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async voteOnProposal(
    proposalId: string,
    userId: string,
    vote: VoteType
  ) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: {
        room: {
          include: {
            members: true,
          },
        },
      },
    });
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    
    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You must be a member to vote');
    }
    
    return this.prisma.tripVote.upsert({
      where: {
        tripProposalId_userId: {
          tripProposalId: proposalId,
          userId,
        },
      },
      create: {
        tripProposalId: proposalId,
        userId,
        vote,
      },
      update: {
        vote,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async updateVote(
    proposalId: string,
    userId: string,
    vote: VoteType
  ) {
    const existingVote = await this.prisma.tripVote.findUnique({
      where: {
        tripProposalId_userId: {
          tripProposalId: proposalId,
          userId,
        },
      },
    });
    
    if (!existingVote) {
      throw new NotFoundException('Vote not found');
    }
    
    return this.prisma.tripVote.update({
      where: {
        tripProposalId_userId: {
          tripProposalId: proposalId,
          userId,
        },
      },
      data: { vote },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async deleteVote(proposalId: string, userId: string) {
    const existingVote = await this.prisma.tripVote.findUnique({
      where: {
        tripProposalId_userId: {
          tripProposalId: proposalId,
          userId,
        },
      },
    });
    
    if (!existingVote) {
      throw new NotFoundException('Vote not found');
    }
    
    return this.prisma.tripVote.delete({
      where: {
        tripProposalId_userId: {
          tripProposalId: proposalId,
          userId,
        },
      },
    });
  }

  // Activities
  async getActivities(proposalId: string) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
    });
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    
    return this.prisma.activitySuggestion.findMany({
      where: { tripProposalId: proposalId },
      include: {
        suggestedBy: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createActivity(
    proposalId: string,
    userId: string,
    data: CreateActivityDto
  ) {
    const proposal = await this.prisma.tripProposal.findUnique({
      where: { id: proposalId },
      include: {
        room: {
          include: {
            members: true,
          },
        },
      },
    });
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    
    const member = proposal.room.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You must be a member to suggest activities');
    }
    
    return this.prisma.activitySuggestion.create({
      data: {
        tripProposalId: proposalId,
        suggestedById: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        estimatedPrice: data.estimatedPrice,
      },
      include: {
        suggestedBy: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async updateActivity(
    activityId: string,
    userId: string,
    data: UpdateActivityDto
  ) {
    const activity = await this.prisma.activitySuggestion.findUnique({
      where: { id: activityId },
      include: {
        tripProposal: {
          include: {
            room: {
              include: {
                members: true,
              },
            },
          },
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
    
    return this.prisma.activitySuggestion.update({
      where: { id: activityId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        estimatedPrice: data.estimatedPrice,
      },
      include: {
        suggestedBy: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async deleteActivity(activityId: string, userId: string) {
    const activity = await this.prisma.activitySuggestion.findUnique({
      where: { id: activityId },
      include: {
        tripProposal: {
          include: {
            room: {
              include: {
                members: true,
              },
            },
          },
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
    
    return this.prisma.activitySuggestion.delete({
      where: { id: activityId },
    });
  }

  // Utils
  private async checkMembership(roomId: string, userId: string) {
    const member = await this.prisma.roomMember.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this room');
    }

    return member;
  }
}
