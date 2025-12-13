import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RegisterDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async register({ email, username, password }: RegisterDto): Promise<{message: string, error?: string}> {

		if (!email || !username || !password) {
			return { message: "Missing fields", error: "Email, username and password are required" };
		}

		const email_exist = await this.prisma.user.findUnique({ where: { email } });

		if (email_exist) {
			return { message: "Email already exists", error: "A user with this email already exists" };
		}

		const username_exist = await this.prisma.user.findUnique({ where: { username }});

		if (username_exist) {
			return { message: "Username already exists", error: "A user with this username already exists" };
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		await this.prisma.user.create({ data: { email, username, passwordHash: hashedPassword }});

		return { message: "User created" };
	}
}
