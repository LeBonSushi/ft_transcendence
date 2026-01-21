import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

interface CreateFromClerkDto {
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

interface UpdateFromClerkDto {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async getUserById(clerkId: string) {
		return this.prisma.user.findUnique({
			where: { id: clerkId },
			include: { profile: true },
		});
	}

	async createFromClerk(data: CreateFromClerkDto) {
    console.log('createFromClerk', data);
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
    console.log('updateFromClerk', clerkId, data);
		const user = await this.getUserById(clerkId);

    //user_38ZDYpdMvIAflhNM2UgzqxSvcV6

		if (!user) {
			throw new NotFoundException('User not found');
		}

    console.log('updating user...');

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
		// Transférer les rooms créées par l'utilisateur au membre le plus ancien
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
				// Transférer au membre le plus ancien
				await this.prisma.room.update({
					where: { id: room.id },
					data: { creatorId: room.members[0].userId },
				});
			} else {
				// Aucun autre membre, supprimer la room
				await this.prisma.room.delete({
					where: { id: room.id },
				});
			}
		}

		// Supprimer l'utilisateur
		return this.prisma.user.delete({
			where: { id: clerkId },
		});
	}

	async updateProfile(userId: string, data: any) {
		return this.prisma.profile.update({
			where: { userId },
			data,
		});
	}

	async modifyUser(id: string, body: UpdateUserDto) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user)
			throw new BadRequestException('User not found');

		const { firstName, lastName, bio, profilePicture, location, birthdate, ...userFields } = body as any;

		if (userFields.password) {
			userFields.passwordHash = await bcrypt.hash(userFields.password, 10);
			delete userFields.password;
		}

		let emailWarning: string | null = null;
		let usernameWarning: string | null = null;

		if (userFields.email && user.email === userFields.email) {
			delete userFields.email;
			emailWarning = 'Email unchanged - same as current email';
		}

		if (userFields.email) {
			console.log('check email');
	
			const existingUsers = await this.prisma.user.findMany({ 
				where: { 
					email: userFields.email,
					id: { not: id }
				} 
			});
			
			if (existingUsers.length > 0) {
				console.log('erreur email');
				throw new ConflictException('Error: email address already used');
			}
		}

		if (userFields.username && user.username === userFields.username) {
			delete userFields.username;
			usernameWarning = 'username unchanged - same as current username';
		}

		if (userFields.username) {
			console.log('check username');
	
			const existingUsers = await this.prisma.user.findMany({ 
				where: { 
					username: userFields.username,
					id: { not: id }
				} 
			});
			
			if (existingUsers.length > 0) {
				console.log('erreur username');
				throw new ConflictException('Error: username address already used');
			}
		}

		await this.prisma.user.update({
			where: { id },
			data: userFields,
		});

		await this.prisma.profile.update({
			where: { userId: id },
			data: { firstName, lastName, bio, profilePicture, location, birthdate },
		});

		const updatedUser = await this.prisma.user.findUnique({
				where: { id },
				include: {
					profile: true,
				}
			});

		const warnings: string[] = [];
		if (emailWarning) warnings.push(emailWarning);
		if (usernameWarning) warnings.push(usernameWarning);

		return warnings.length > 0 ? { user: updatedUser, warnings } : updatedUser;
	}

	async getRoomsByUser(clerkId: string) {
		const user = this.getUserById(clerkId);

		if (!user)
			throw new BadRequestException('User not found');

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
								}
							}
						}
					}
				}
			});

		if (!userWithRooms)
			return [];

		return userWithRooms.roomMemberships.map(m => m.room);
	}

	async getFriendById(clerkId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: clerkId },
			include: {
				sentFriendRequests: true,
				receivedFriendRequests: true,
			}
		});
		if (!user)
			throw new BadRequestException('User not found');
		console.log(user);
		return { user };
	}
}
