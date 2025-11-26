import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
	@Post('login')
	login(@Body() body) {
		// body = { email, password } envoyé depuis le client
		// ici tu peux faire appel à ton service qui checke la DB
		return { message: 'Login OK', data: body };
	}

	@Post('register')
	register(@Body() body) {
		return { message: 'Register OK', data: body };
	}
}
