import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async register({ email, username, password }: RegisterDto): Promise<{user?: {email: string, username: string}, message: string, error?: string, status?: number}> {

		if (!email || !username || !password) {
			return { message: "Missing fields", error: "Email, username and password are required", status: 400 };
		}

		const email_exist = await this.prisma.user.findUnique({ where: { email } });

		if (email_exist) {
			return { message: "A user with this email already exists", error: "Invalid credentials", status: 400  };
		}

		const username_exist = await this.prisma.user.findUnique({ where: { username }});

		if (username_exist) {
			return { message: "A user with this username already exists", error: "Invalid credentials" , status: 400  };
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		await this.prisma.user.create({ data: { email, username, password: hashedPassword }});

		return { user: { email, username }, message: "User created", status: 201 };
	}

	async validateUser(username: string, password: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({ where: { username } });

		if (!user) {
			return false;
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		return isPasswordValid;
	}

	async login({username, password}: LoginDto): Promise<{data?, message: string, error?: string}> {

		const isValid = await this.validateUser(username, password);

		if (!isValid) {
			return { message: "Invalid username or password", error: "Invalid credentials" };
		}

		const user = await this.prisma.user.findUnique({ where: { username } });

		return { data: user, message: "Login successful" };
	}
}
