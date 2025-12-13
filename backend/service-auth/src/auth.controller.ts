import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: LoginDto) {

		const data = await this.authService.login(body);

		return { data };
	}

	@Post('register')
	async register(@Body() body: RegisterDto) {

		const data = await this.authService.register(body);

		return { data };
	}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
