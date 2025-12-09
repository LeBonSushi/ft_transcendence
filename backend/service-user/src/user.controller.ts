import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { GetUserDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(':id')
	async getUserById(@Req() req: GetUserDto) {
		const user = await this.userService.getUserById(req.id);
		return user;
	}

	@Get('coucou')
	async test() {
		const user = await this.userService.getUserById(1);
		console.log(user);
		return user;
	}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
