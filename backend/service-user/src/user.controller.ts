import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Req, Put, Param } from '@nestjs/common';
import { GetUserDto, UpdateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(':id')
	async getUserById(@Param('id') id: string) {
		const user = await this.userService.getUserById(parseInt(id, 10));
		return user;
	}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}

	@Put(':id')
	async modifyUser(@Param('id') id: number, @Body() body: UpdateUserDto) {
		return await this.userService.modifyUser(id, body);
	} 
}
