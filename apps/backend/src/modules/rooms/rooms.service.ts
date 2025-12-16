import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { name: string; description?: string }) {
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
      // Transfer admin or handle accordingly
      throw new ForbiddenException('Admin must transfer role before leaving');
    }

    return this.prisma.roomMember.delete({
      where: {
        id: member.id,
      },
    });
  }

  async createProposal(roomId: string, userId: string, data: any) {
    // Check if user is member
    await this.checkMembership(roomId, userId);

    return this.prisma.tripProposal.create({
      data: {
        ...data,
        roomId,
      },
      include: {
        votes: true,
        activities: true,
      },
    });
  }

  async vote(proposalId: string, userId: string, vote: 'YES' | 'NO' | 'MAYBE') {
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
    });
  }

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
