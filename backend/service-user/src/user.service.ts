import { Injectable, BadRequestException } from '@nestjs/common';
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
		if (!user) throw new BadRequestException('User not found');

		const { firstName, lastName, bio, profilePicture, location, birthdate, ...userFields } = body as any;

		if (userFields.password) {
			userFields.passwordHash = await bcrypt.hash(userFields.password, 10);
			delete userFields.password;
		}

		await this.prisma.user.update({
			where: { id },
			data: userFields,
		});

		await this.prisma.profile.update({
			where: { userId: id },
			data: { firstName, lastName, bio, profilePicture, location, birthdate },
		});

		return this.prisma.user.findUnique({
			where: { id },
			include: {
				profile: true,
			}
		});
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