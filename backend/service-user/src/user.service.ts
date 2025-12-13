import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UpdateUserDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUserById(id: number) {
		return this.prisma.user.findUnique({
			where: { id },
			include: {
				profile: true,
			},
		});
	}

	async modifyUser(id: number, body: UpdateUserDto) {
		// Validate user exists
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) {
			throw new BadRequestException('User not found');
		}

		// Separate User and Profile fields
		const { firstName, lastName, bio, ...userFields } = body;

		// Hash password if provided
		if (userFields.password) {
			userFields.password = await bcrypt.hash(userFields.password, 10);
		}

		// Check email uniqueness if being updated
		if (userFields.email && userFields.email !== user.email) {
			const existingUser = await this.prisma.user.findUnique({
				where: { email: userFields.email },
			});
			if (existingUser) {
				throw new BadRequestException('Email already in use');
			}
		}

		// Update User fields
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: userFields as any,
			include: {
				profile: true,
			},
		});

		// Update Profile fields if provided
		if (firstName !== undefined || lastName !== undefined || bio !== undefined) {
			await this.prisma.profile.upsert({
				where: { userId: id },
				update: {
					...(firstName !== undefined && { firstName }),
					...(lastName !== undefined && { lastName }),
					...(bio !== undefined && { bio }),
				},
				create: {
					userId: id,
					firstName,
					lastName,
					bio,
				},
			});

			// Return updated user with profile
			return this.prisma.user.findUnique({
				where: { id },
				include: {
					profile: true,
				},
			});
		}

		return updatedUser;
	}
}