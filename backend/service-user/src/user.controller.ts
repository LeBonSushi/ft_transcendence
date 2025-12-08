import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
