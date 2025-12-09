import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUserById(id: number) {
		return this.prisma.user.findUnique({
			where: { id },
		});
	}
}