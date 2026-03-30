import { Injectable, Inject, forwardRef, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
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
import { NotificationType, type MemberRole, type VoteType } from '@travel-planner/shared';
import { RoomsGateway } from './rooms.gateway';
import { start } from 'repl';
import { AvailabilityService } from './availability.service';
import { PlanningService } from './planning.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTemplates } from '../notifications/templates/templates';

/**
 * Safe user select - excludes sensitive fields like passwordHash, email, 2FA secrets
 */
const SAFE_USER_SELECT = {
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => RoomsGateway))
    private roomsGateway: RoomsGateway,
    private availabilityService: AvailabilityService,
    private planningService: PlanningService,
    @Inject (forwardRef(() => NotificationsService))
    private notificationsService : NotificationsService
  ) {}

  // CRUD ROOM
  async create(userId: string, data: CreateRoomDto) {
    if (data.type === 'DIRECT_MESSAGE') {
      if (!data.invitedUserId) {
        throw new ConflictException('invitedUserId is required for DIRECT_MESSAGE');
      }

      if (data.invitedUserId === userId) {
        throw new ConflictException('You cannot create a direct message with yourself');
      }

      const existingDm = await this.prisma.room.findFirst({
        where: {
          type: 'DIRECT_MESSAGE',
          AND: [
            { members: { some: { userId } } },
            { members: { some: { userId: data.invitedUserId } } },
            { members: { every: { userId: { in: [userId, data.invitedUserId] } } } },
          ],
        },
        include: {
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
          messages: {
            select: {
              content: true,
              createdAt: true,
              sender: {
                select: {
                  username: true,
                  profile: {
                    select: {
                      profilePicture: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (existingDm) {
        return existingDm;
      }

      const room = await this.prisma.room.create({
        data: {
          name: data.name,
          description: data.description,
          isPrivate: true,
          creatorId: userId,
          type: data.type,
          members: {
            create: [
              {
                userId,
                role: 'ADMIN',
              },
              {
                userId: data.invitedUserId,
                role: 'MEMBER',
              },
            ],
          },
        },
        include: {
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
          messages: {
            select: {
              content: true,
              createdAt: true,
              sender: {
                select: {
                  username: true,
                  profile: {
                    select: {
                      profilePicture: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const creatorRoom = this.mapRoomWithLastMessage(room, userId);
      const invitedRoom = this.mapRoomWithLastMessage(room, data.invitedUserId);
      const invitedMember = room.members.find((member) => member.userId === data.invitedUserId);

      this.roomsGateway.emitRoomCreated(creatorRoom);
      if (invitedMember) {
        this.roomsGateway.emitMemberInvited(room.id, invitedMember, invitedRoom);
      }

      return room;
    }

    const room = await this.prisma.room.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate ?? false,
        creatorId: userId,
        type: data.type,
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

    const roomWithLastMessage = this.mapRoomWithLastMessage(room, userId);
    this.roomsGateway.emitRoomCreated(roomWithLastMessage);

    return room;
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
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

    const updatedRoom = await this.prisma.room.update({
      where: {id: roomId},
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      },
      include: {
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
      },
    });

    this.roomsGateway.emitRoomUpdated(roomId, updatedRoom);

    return updatedRoom;
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete the room');
    }

    const roomName = await this.prisma.room.findUnique({where : {id : roomId}, select : {name : true}})

    await this.notificationsService.sendNotificationToRoom(
      NotificationTemplates.getTemplate(NotificationType.ROOM_DELETED, {toRoomId : roomId, roomName : room.name})
    )
    this.roomsGateway.emitRoomDeleted(roomId);

    return this.prisma.room.delete({
      where: {
        id: roomId,
      }
    });
  }

  // RoomMembers
  async joinRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    // Vérifier si la room est privée
    if (room.isPrivate) {
      throw new ForbiddenException('Cette room est privée. Vous devez être invité pour la rejoindre.');
    }

    const existingMember = room.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new ForbiddenException('Already a member of this room');
    }

    const member = await this.prisma.roomMember.create({
      data: {
        roomId,
        userId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
      },
    });

    this.roomsGateway.emitMemberJoined(roomId, member);

    return member;
  }

  async inviteUser(roomId: string, invitedUserId: string, requesterId: string) {
    const room = await this.findById(roomId);

    // Vérifier que le requester est membre de la room
    const requesterMember = room.members.find((m) => m.userId === requesterId);
    if (!requesterMember) {
      throw new ForbiddenException('Vous devez être membre de cette room pour inviter');
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = room.members.find((m) => m.userId === invitedUserId);
    if (existingMember) {
      throw new ForbiddenException('Cet utilisateur est déjà membre de cette room');
    }

    // Ajouter l'utilisateur à la room (fonctionne même si la room est privée)
    const member = await this.prisma.roomMember.create({
      data: {
        roomId,
        userId: invitedUserId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
      },
    });

    const roomWithLastMessage = {
      id: room.id,
      name: room.name,
      type: room.type,
      description: room.description,
      status: room.status,
      isPrivate: room.isPrivate,
      creatorId: room.creatorId,
      imageUrl: room.imageUrl,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      lastMessage: null,
      lastMessageDate: null,
      senderUsername: null,
      senderPicture: null,
    };

    this.roomsGateway.emitMemberInvited(roomId, member, roomWithLastMessage);
    const roomNameAttribute = await this.prisma.room.findUnique({where : {id : roomId}, select : {name : true}})
    await this.notificationsService.createNotification(NotificationTemplates.getTemplate(NotificationType.ROOM_INVITE, {toUserId : invitedUserId, roomName : roomNameAttribute?.name  }))

    return member;
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

    const result = await this.prisma.roomMember.delete({
      where: {
        id: member.id,
      },
    });

    this.roomsGateway.emitMemberLeft(roomId, userId);

    return result;
  }

  async getMembers(roomId: string) {
    await this.findById(roomId);

    return this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
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

    const updatedMember = await this.prisma.roomMember.update({
      where: { id: targetMember.id },
      data: { role },
      include: {
        user: {
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
      },
    });

    this.roomsGateway.emitMemberRoleUpdated(roomId, updatedMember);

    return updatedMember;
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

    const result = await this.prisma.roomMember.delete({
      where: { id: targetMember.id },
    });

    this.roomsGateway.emitMemberKicked(roomId, targetUserId);

    return result;
  }

  // Availabilities - delegated to AvailabilityService
  async getAvailabilities(roomId: string) {
    await this.findById(roomId);
    return this.availabilityService.getAvailabilities(roomId);
  }

  async createAvailability(
    roomId: string,
    userId: string,
    data: CreateAvailabilityDto
  ) {
    await this.checkMembership(roomId, userId);
    return this.availabilityService.createAvailability(roomId, userId, data);
  }

  async updateAvailability(
    availabilityId: string,
    userId: string,
    data: UpdateAvailabilityDto
  ) {
    return this.availabilityService.updateAvailability(availabilityId, userId, data);
  }

  async deleteAvailability(availabilityId: string, userId: string) {
    return this.availabilityService.deleteAvailability(availabilityId, userId);
  }

  // Proposal - delegated to PlanningService
  async getProposals(roomId: string) {
    await this.findById(roomId);
    return this.planningService.getProposals(roomId);
  }

  async createProposal(
    roomId: string,
    userId: string,
    data: CreateProposalDto
  ) {
    await this.checkMembership(roomId, userId);
    return this.planningService.createProposal(roomId, userId, data);
  }

  async updateProposal(
    proposalId: string,
    userId: string,
    data: UpdateProposalDto
  ) {
    return this.planningService.updateProposal(proposalId, userId, data);
  }

  async deleteProposal(proposalId: string, userId: string) {
    return this.planningService.deleteProposal(proposalId, userId);
  }

  async selectProposal(proposalId: string, userId: string) {
    return this.planningService.selectProposal(proposalId, userId);
  }

  // Vote - delegated to PlanningService
  async getVotes(proposalId: string) {
    return this.planningService.getVotes(proposalId);
  }

  async voteOnProposal(
    proposalId: string,
    userId: string,
    vote: VoteType
  ) {
    return this.planningService.voteOnProposal(proposalId, userId, vote);
  }

  async updateVote(
    proposalId: string,
    userId: string,
    vote: VoteType
  ) {
    return this.planningService.updateVote(proposalId, userId, vote);
  }

  async deleteVote(proposalId: string, userId: string) {
    return this.planningService.deleteVote(proposalId, userId);
  }

  // Activities - delegated to PlanningService
  async getActivities(proposalId: string) {
    return this.planningService.getActivities(proposalId);
  }

  async createActivity(
    proposalId: string,
    userId: string,
    data: CreateActivityDto
  ) {
    return this.planningService.createActivity(proposalId, userId, data);
  }

  async updateActivity(
    activityId: string,
    userId: string,
    data: UpdateActivityDto
  ) {
    return this.planningService.updateActivity(activityId, userId, data);
  }

  async deleteActivity(activityId: string, userId: string) {
    return this.planningService.deleteActivity(activityId, userId);
  }

  async matchingDate(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        type: true,
        members: {
          select: {
            userId: true,
          }
        }
      },
    });

    if (!room)
      throw new NotFoundException('Room doesn\'t exist');

    if (room.type === 'DIRECT_MESSAGE')
      return null;

    const availabilities = await this.prisma.userAvailability.findMany({
      where: { roomId: room.id },
      orderBy: {
        startDate: "asc"
      },
    });

    if (!availabilities.length)
      throw new NotFoundException('No availabilities found for this room');

    // Set of members that belong to the room
    const memberId = new Set(room.members.map((m) => m.userId));

    // Keep only availabilities from room members, then validate date ranges
    const valideMembers = availabilities.filter((a) => memberId.has(a.userId));
    valideMembers.forEach((a) => {
      if (a.startDate >= a.endDate)
          throw new ConflictException(`Date are invalid for ${a.userId}`);
    });

    // Users that have at least one valid availability in this room
    const userAvailable = new Set(valideMembers.map((a) => a.userId));
    if (userAvailable.size < 2)
      throw new ConflictException('We need a minimum of 2 person to match the date');

    // Sweep-line events: +1 when user enters availability, -1 when user leaves
    type Event = { at: number; userId: string; isHere: 1 | -1 }
    const events: Event[] = [];
    for (const a of valideMembers) {
      events.push({ at: a.startDate.getTime(), userId: a.userId, isHere: 1 });
      events.push({ at: a.endDate.getTime(), userId: a.userId, isHere: -1 });
    }

    // Sort by time, then by event type.
    // With [start, end) intervals, handling -1 before +1 at same timestamp avoids fake overlap.
    events.sort((first, second) => (first.at - second.at) || (first.isHere - second.isHere));

    // Track active users while scanning the timeline
    const activeCount = new Map<string, number>();
    const activeUsers = new Set<string>();

    type Segment = { start: number, end: number, users: Set<string> };
    const segments: Segment[] = [];

    let i = 0;
    while (i < events.length) {
      const time = events[i].at;

      // Apply all events at the same timestamp
      while (i < events.length && events[i].at === time) {
        const event = events[i];
        const next = (activeCount.get(event.userId) ?? 0) + event.isHere;

        if (next <= 0) {
          activeCount.delete(event.userId);
          activeUsers.delete(event.userId);
        }
        else {
          activeCount.set(event.userId, next);
          activeUsers.add(event.userId);
        }
        i++;
      }
      
      // check that the next entrie is superior and if the number of active user for this state is above 0
      // then save all the users available for this segment
      if (i < events.length) {
        const nextTime = events[i].at;
        if (nextTime > time && activeUsers.size > 0)
          segments.push({ start: time, end: nextTime, users: new Set(activeUsers) });
      }
    }

    if (!segments.length)
      throw new ConflictException('Not matching date find');

    const hasSameUsers = (firstUsers: Set<string>, secondUsers: Set<string>) => {
      if (firstUsers.size !== secondUsers.size)
        return false;

      for (const userId of firstUsers) {
        if (!secondUsers.has(userId))
          return false;
      }

      return true;
    };

    const mergedSegments: Segment[] = [];
    for (const segment of segments) {
      const previous = mergedSegments[mergedSegments.length - 1];

      if (
        previous &&
        previous.end === segment.start &&
        hasSameUsers(previous.users, segment.users)
      ) {
        previous.end = segment.end;
      }
      else {
        mergedSegments.push({
          start: segment.start,
          end: segment.end,
          users: new Set(segment.users),
        });
      }
    }

    const totalUsers = userAvailable.size;
    const fallback70 = Math.max(2, Math.ceil(totalUsers * 0.7)); //2: min users matching | 0.7: percentage of user in the match
    const fallback50 = Math.max(2, Math.ceil(totalUsers * 0.5)); //2: min users matching | 0.5: percentage of user in the match
    const fallback30 = Math.max(2, Math.ceil(totalUsers * 0.3)); //2: min users matching | 0.3: percentage of user in the match

    // 3 fallback (70 percent of the user or 50 or 30)
    const segment100 = mergedSegments.filter((s) => s.users.size === totalUsers);
    const segment70 = mergedSegments.filter((s) => s.users.size >= fallback70);
    const segment50 = mergedSegments.filter((s) => s.users.size >= fallback50);
    const segment30 = mergedSegments.filter((s) => s.users.size >= fallback30);
    
    let finalSegment: Segment[];

    if (segment100.length)
        finalSegment = segment100;
    else if (segment70.length)
        finalSegment = segment70;
    else if (segment50.length)
        finalSegment = segment50;
    else if (segment30.length)
        finalSegment = segment30;
    else
      throw new ConflictException('No slot found with each configuration tested, no matching date can be calculated');

    // Pick the best segment by priority:
    // 1) more users, 2) longer duration, 3) earlier start
    const isBetter = (a: Segment, b: Segment) => {
      if (a.users.size !== b.users.size)
        return a.users.size > b.users.size;

      const aDuration = a.end - a.start;
      const bDuration = b.end - b.start;

      if (aDuration !== bDuration)
          return aDuration > bDuration;
      return a.start < b.start;
    };

    let best = finalSegment[0];
    for (const s of finalSegment) {
      if (isBetter(s, best))
        best = s;
    }

    const matchUsers = [...best.users];
    const droppedUsers = [...memberId].filter((id) => !best.users.has(id));


    return {
      startDate: new Date(best.start),
      endDate: new Date(best.end),
      duration: Math.ceil((best.end - best.start) / (1000 * 60 * 60 * 24)),
      matchUser: matchUsers.length,
      droppedUser: droppedUsers,
    };
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

  private mapRoomWithLastMessage(room: any, currentUserId: string) {
    const lastMsg = room.messages?.[0] ?? null;

    let roomName = room.name;
    if (room.type === 'DIRECT_MESSAGE') {
      const otherMember = room.members?.find((member: any) => member.userId !== currentUserId)?.user;
      if (otherMember) {
        const firstName = otherMember.profile?.firstName;
        const lastName = otherMember.profile?.lastName;
        roomName = firstName
          ? `${firstName} ${lastName ?? ''}`.trim()
          : otherMember.username;
      }
    }

    return {
      id: room.id,
      name: roomName,
      type: room.type,
      description: room.description,
      status: room.status,
      isPrivate: room.isPrivate,
      creatorId: room.creatorId,
      imageUrl: room.imageUrl,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      lastMessage: lastMsg?.content ?? null,
      lastMessageDate: lastMsg?.createdAt ?? null,
      senderUsername: lastMsg?.sender?.username ?? null,
      senderPicture: lastMsg?.sender?.profile?.profilePicture ?? null,
    };
  }
}
