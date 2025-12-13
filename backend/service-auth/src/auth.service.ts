import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from './services/jwt.service';
import { LoginResponse, RegisterResponse } from './types/Response';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService) {}

	async register({ email, username, password }: RegisterDto): Promise<RegisterResponse> {
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

		const created = await this.prisma.user.create({ data: { email, username, passwordHash: hashedPassword }});

		if (!created) {
			throw new BadRequestException("User could not be created");
		}


		return { message: "User created", user: {
			id: created.id,
			email: created.email,
			username: created.username,
		}};
	}

	async validateUser(email: string, password: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) {
			return { valid: false, exists: false };
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		return { valid: isPasswordValid, exists: true };
	}

	async login({email, password}: LoginDto): Promise<LoginResponse> {

		const isValid = await this.validateUser(email, password);

		if (!isValid) {
			throw new UnauthorizedException("Invalid username or password");
		}

		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) {
			throw new UnauthorizedException("Invalid username or password");
		}

		const { accessToken, refreshToken } = await this.jwt.generateTokens({ userId: user.id, username: user.username });

		const publicUser = {
			id: user.id,
			email: user.email,
			username: user.username,
		};

		return { data: { user: publicUser, accessToken, refreshToken }, message: "Login successful" };
	}
}
