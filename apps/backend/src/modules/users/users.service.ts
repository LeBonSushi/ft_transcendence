import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { SearchUser } from '@travel-planner/shared';

interface CreateUserDto {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  async createUser(data: CreateUserDto) {
    this.logger.debug(`Creating user: ${data.id}`);

    return this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        username: data.username,
        profile: data.firstName && data.lastName ? {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            profilePicture: data.profilePicture,
          },
        } : undefined,
      },
      include: {
        profile: true,
      },
    });
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    this.logger.debug(`Updating user: ${userId}`);

    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        username: data.username,
        profile: data.firstName && data.lastName ? {
          upsert: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              profilePicture: data.profilePicture,
            },
            update: {
              firstName: data.firstName,
              lastName: data.lastName,
              profilePicture: data.profilePicture,
            },
          },
        } : undefined,
      },
      include: {
        profile: true,
      },
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
        await this.prisma.room.update({
          where: { id: room.id },
          data: { creatorId: room.members[0].userId },
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

  async updateProfile(userId: string, data: any) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { userId },
      data,
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

    await this.prisma.user.update({
      where: { id },
      data: userFields,
    });

    await this.prisma.profile.upsert({
      where: { userId: id },
      update: { firstName, lastName, bio, profilePicture, location, birthdate },
      create: { userId: id, firstName, lastName, bio, profilePicture, location, birthdate },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    return warnings.length > 0 ? { user: updatedUser, warnings } : updatedUser;
  }

  async getRoomsByUser(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithRooms = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roomMemberships: {
          select: {
            room: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                creatorId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!userWithRooms) {
      return [];
    }

    return userWithRooms.roomMemberships.map((m) => m.room);
  }

  async getFriends(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: {
        sentFriendRequests: true,
        receivedFriendRequests: true,
      },
    });

    if (!user)
      throw new NotFoundException('User not found');

    return user;
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
        AND similarity(u.username, ${searchQuery}) > 0.02
      ORDER BY similarity(u.username, ${searchQuery}) DESC
      LIMIT 5
    `;

    return users;
  }
}
