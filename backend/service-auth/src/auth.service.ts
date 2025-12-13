import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponse, RegisterResponse } from './types/Response';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService) {}

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

	async validateUser(email: string, password: string): Promise<{ valid: boolean; exists: boolean }> {
		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) {
			return { valid: false, exists: false };
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		return { valid: isPasswordValid, exists: true };
	}

	async login({email, password}: LoginDto): Promise<LoginResponse> {

		const {valid, exists} = await this.validateUser(email, password);

		if (!exists) {
			throw new UnauthorizedException("Aucun utilisateur ne correspond à cet e-mail");
		}

		if (!valid) {
			throw new UnauthorizedException("Mot de passe invalide");
		}

		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) {
			throw new UnauthorizedException("Utilisateur introuvable après validation.");
		}

		const payload = { userId: user.id, username: user.username };

		// Generate access token
		const accessToken = await this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>('JWT_SECRET'),
			expiresIn: '15m',
		});

		// Generate refresh token
		const refreshToken = await this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			expiresIn: '7d',
		});

		const publicUser = {
			id: user.id,
			email: user.email,
			username: user.username,
		};

		return { data: { user: publicUser, accessToken, refreshToken }, message: "Login successful" };
	}
}
