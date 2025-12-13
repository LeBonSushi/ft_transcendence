import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { RegisterResponse } from './types/Response';
import { Response } from 'express';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
		const result = await this.authService.login(body);

		res.cookie('refreshToken', result.data.refreshToken, {
			httpOnly: process.env.NODE_ENV === 'production',
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.cookie('accessToken', result.data.accessToken, {
			httpOnly: process.env.NODE_ENV === 'production',
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000,
		});

		return {
			message: result.message,
			data: {
				user: result.data.user,
			},
		}
	}

	@Post('register')
	async register(@Body() body: RegisterDto) {
		return await this.authService.register(body);
	}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
