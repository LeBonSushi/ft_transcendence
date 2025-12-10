import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async register({ email, username, password }: RegisterDto): Promise<{user: {email: string, username: string}, message: string }> {

		if (!email || !username || !password) {
			throw new BadRequestException("Email, username and password are required");
		}

		const email_exist = await this.prisma.user.findUnique({ where: { email } });

		if (email_exist) {
			throw new ConflictException("A user with this email already exists");
		}

		const username_exist = await this.prisma.user.findUnique({ where: { username }});

		if (username_exist) {
			throw new ConflictException("A user with this username already exists");
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		await this.prisma.user.create({ data: { email, username, password: hashedPassword }});

		return { user: { email, username }, message: "User created"};
	}

	async validateUser(email: string, password: string): Promise<{ valid: boolean, exists: boolean }> {
		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) {
			return { valid: false, exists: false };
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		return { valid: isPasswordValid, exists: true };
	}

	async login({ email, password }: LoginDto): Promise<{data: any, message: string}> {
		const { valid, exists } = await this.validateUser(email, password);

		if (!exists) {
			throw new UnauthorizedException("User does not exist");
		}

		if (!valid) {
			throw new UnauthorizedException("Invalid password");
		}

		console.log(`[AuthService] User ${email} logged in successfully`);

		const user = await this.prisma.user.findUnique({ where: { email } });

		return { data: user, message: "Login successful" };
	}
}
