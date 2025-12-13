import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UpdateUserDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { first } from 'rxjs';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUserById(id: string) {
		return this.prisma.user.findUnique({
			where: { id },
			include: {
				profile: true,
			},
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

	async getRoomsByUser(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				createdRooms: true,
				roomMemberships: { include: { room: true } },
			},
		});

		if (!user)
			throw new BadRequestException('User not found');

		const memberRooms = user.roomMemberships.map(m => m.room);
		return { createdRooms: user.createdRooms, memberRooms };
	}

	async getFriendById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
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