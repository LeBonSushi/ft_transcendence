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
			where: { clerkId },
			include: { profile: true },
		});
	}

	async createFromClerk(data: CreateFromClerkDto) {
		return this.prisma.user.create({
			data: {
				clerkId: data.clerkId,
				email: data.email,
				username: data.username,
				oauthProvider: 'clerk',
				oauthId: data.clerkId,
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
		const user = await this.getUserById(clerkId);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return this.prisma.user.update({
			where: { clerkId },
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
		return this.prisma.user.delete({
			where: { clerkId },
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
				where: { clerkId: clerkId },
				select: {
					roomMemberships: {
						select: {
							room: {
								select: {
									name: true,
									messages: {
										orderBy: { createdAt: 'desc' },
										take: 1,
										select: {
											content: true,
											createdAt: true,
											sender: {
												select: {
													username: true,
													profile: {
														select: {
															profilePicture: true,
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			});

		if (!userWithRooms)
			return { message: 'no room join'};

		return userWithRooms.roomMemberships
			.map(m => ({
				name: m.room.name,
				lastMessage: m.room.messages[0]?.content || null,
				lastMessageDate: m.room.messages[0]?.createdAt || null,
				senderUsername: m.room.messages[0]?.sender.username || null,
				senderPicture: m.room.messages[0]?.sender.profile?.profilePicture || null,
			}))
			.sort((a, b) => 
				new Date(b.lastMessageDate || 0).getTime() - new Date(a.lastMessageDate || 0).getTime()
			)
	}

	async getFriendById(clerkId: string) {
		const user = await this.prisma.user.findUnique({
			where: { clerkId: clerkId },
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
