import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, ConflictException, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { SearchUser, RoomWithLastMessage, NotificationType } from '@travel-planner/shared';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTemplates } from '../notifications/templates/templates';

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  async deleteUser(userId: string) {

    const roomsCreated = await this.prisma.room.findMany({
      where: { creatorId: userId },
      include: {
        members: {
          where: { userId: { not: userId } },
          orderBy: { joinedAt: 'asc' },
          take: 1,
        },
      },
    });

    for (const room of roomsCreated) {
      if (room.members.length > 0) {
        const nextCreatorMembership = room.members[0];

        await this.prisma.room.update({
          where: { id: room.id },
          data: {
            creatorId: nextCreatorMembership.userId,
            members: {
              updateMany: {
                where: { userId: nextCreatorMembership.userId },
                data: { role: 'ADMIN' },
              },
            },
          },
        });
      } else {
        await this.prisma.room.delete({
          where: { id: room.id },
        });
      }
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Validates that a field value is unique among users (excluding current user)
   */
  private async validateUniqueField(
    field: 'email' | 'username',
    value: string,
    excludeUserId: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        [field]: value,
        id: { not: excludeUserId },
      },
    });

    if (existingUser) {
      throw new ConflictException(`This ${field} is already in use`);
    }
  }

  async modifyUser(id: string, body: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { firstName, lastName, bio, profilePicture, location, birthdate, ...userFields } = body as any;

    if (userFields.password) {
      userFields.passwordHash = await bcrypt.hash(userFields.password, 10);
      delete userFields.password;
    }

    const warnings: string[] = [];

    // Handle email update
    if (userFields.email) {
      if (user.email === userFields.email) {
        delete userFields.email;
        warnings.push('Email unchanged - same as current email');
      } else {
        await this.validateUniqueField('email', userFields.email, id);
      }
    }

    // Handle username update
    if (userFields.username) {
      if (user.username === userFields.username) {
        delete userFields.username;
        warnings.push('Username unchanged - same as current username');
      } else {
        await this.validateUniqueField('username', userFields.username, id);
      }
    }

    const hasUserFields = Object.keys(userFields).length > 0;

    const profileUpdateData: Record<string, unknown> = {};
    if (firstName !== undefined)
      profileUpdateData.firstName = firstName;
    if (lastName !== undefined)
      profileUpdateData.lastName = lastName;
    if (profilePicture !== undefined)
      profileUpdateData.profilePicture = profilePicture;
    const hasProfileFields = Object.keys(profileUpdateData).length > 0;

    if (hasUserFields) {
      await this.prisma.user.update({
        where: { id },
        data: userFields,
      });
    }

    if (hasProfileFields) {
      const existingProfile = await this.prisma.profile.findUnique({
        where: { userId: id },
        select: { userId: true },
      });

      if (existingProfile) {
        await this.prisma.profile.update({
          where: { userId: id },
          data: profileUpdateData,
        });
      }
      else {
        await this.prisma.profile.create({
          data: {
            userId: id,
            firstName: firstName ?? '',
            lastName: lastName ?? '',
            ...(profilePicture !== undefined ? { profilePicture } : {}),
          },
        });
      }
    }

    const updatedUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...SAFE_USER_SELECT,
        profile: true,
      },
    });

    return warnings.length > 0 ? { user: updatedUser, warnings } : updatedUser;
  }

  async getRoomsByUser(userId: string) {
    const userWithRooms = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roomMemberships: {
          select: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
                description: true,
                status: true,
                isPrivate: true,
                creatorId: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
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
                members: {
                  select: {
                    userId: true,
                    user: {
                      select: {
                        username: true,
                        profile: {
                          select: {
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRooms) {
      return [];
    }

    return userWithRooms.roomMemberships.map((m) => {
      const lastMsg = m.room.messages[0] ?? null;
      const otherMember = m.room.type === 'DIRECT_MESSAGE'
        ? m.room.members.find((member) => member.userId !== userId)?.user
        : null;
      const dmName = otherMember
        ? (otherMember.profile?.firstName
          ? `${otherMember.profile.firstName} ${otherMember.profile.lastName ?? ''}`.trim()
          : otherMember.username)
        : m.room.name;

      const { messages, members, ...room } = m.room;
      return {
        ...room,
        name: m.room.type === 'DIRECT_MESSAGE' ? dmName : m.room.name,
        lastMessage: lastMsg?.content ?? null,
        lastMessageDate: lastMsg?.createdAt ?? null,
        senderUsername: lastMsg?.sender.username ?? null,
        senderPicture: lastMsg?.sender.profile?.profilePicture ?? null,
        otherUserPicture: otherMember?.profile?.profilePicture ?? null,
      };
    });
  }

  async getFriends(id: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId: id }, { friendId: id }],
      },
      include: {
        user: { 
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
        friend: { 
          select: {
            ...SAFE_USER_SELECT,
            profile: true,
          },
        },
      },
    });

    return friendships.map(f => (f.userId === id ? f.friend : f.user));
  }

  async searchUser(currentUserId: string, searchQuery: string) {
    if (!searchQuery || searchQuery.trim().length === 0)
      return [];

    const users = await this.prisma.$queryRaw<SearchUser[]>`
      SELECT
        u.id,
        u.username,
        jsonb_build_object(
          'firstName', p."firstName",
          'lastName', p."lastName",
          'profilePicture', p."profilePicture"
        ) as profile
      FROM "User" u
      LEFT JOIN "Profile" p ON u.id = p."userId"
      WHERE u.id != ${currentUserId}
        AND u.username ILIKE ${searchQuery + '%'}
        AND NOT EXISTS (
          SELECT 1
          FROM "Friendship" f
          WHERE (
            (f."userId" = ${currentUserId} AND f."friendId" = u.id)
            OR (f."userId" = u.id AND f."friendId" = ${currentUserId})
          )
          AND f.status = 'ACCEPTED'
        )
      ORDER BY similarity(u.username, ${searchQuery}) DESC
      LIMIT 5
    `;

      return users || [];
  }
}
