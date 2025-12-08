import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	login(@Body() body: LoginDto) {
		// body est validé automatiquement: username (string) et password (min 6 chars)
		// Si validation échoue → 400 Bad Request avec détails de l'erreur
		return { message: 'Login OK', data: body };
	}

	@Post('register')
	register(@Body() body: RegisterDto) {
		// Validation auto: username (string), email (format email), password (min 6 chars)
		// whitelist: true → supprime les champs non définis dans le DTO
		return { message: 'Register OK', data: body };
	}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
