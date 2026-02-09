import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { UpdateUserDto, CreateFromClerkDto, UpdateFromClerkDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async getUserById(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { id: clerkId },
      include: { profile: true },
    });
  }

  async createFromClerk(data: CreateFromClerkDto) {
    this.logger.debug(`Creating user from Clerk: ${data.clerkId}`);

    return this.prisma.user.create({
      data: {
        id: data.clerkId,
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

  async updateFromClerk(clerkId: string, data: UpdateFromClerkDto) {
    this.logger.debug(`Updating user from Clerk: ${clerkId}`);

    const user = await this.getUserById(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: clerkId },
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

  async deleteByClerkId(clerkId: string) {
    const roomsCreated = await this.prisma.room.findMany({
      where: { creatorId: clerkId },
      include: {
        members: {
          where: { userId: { not: clerkId } },
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
      where: { id: clerkId },
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

  async getRoomsByUser(clerkId: string) {
    const user = await this.getUserById(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithRooms = await this.prisma.user.findUnique({
      where: { id: clerkId },
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

  async getFriend(clerkId: string) {
	const user = await this.prisma.user.findUnique({
		where: { id: clerkId },
		include: {
			sentFriendRequests: true,
			receivedFriendRequests: true,
		},
	});

	if (!user)
		throw new NotFoundException('User not found');

	return user;
  }

  async sendFriendRequest(clerkId: string, friendId: string) {
	const IsUserexist = await this.prisma.user.findUnique({
		where: { id: friendId }
	})

	if (!IsUserexist)
		throw new NotFoundException('user not found');

	const currentUser = await this.prisma.user.findUnique({
		where: { id: clerkId },
		include: {
			sentFriendRequests: true,
			receivedFriendRequests: true,
		}
	})

	if (!currentUser)
		throw new NotFoundException('user not found');

	console.log("friend to add: ", IsUserexist, ", current user :", currentUser);
  }
}
