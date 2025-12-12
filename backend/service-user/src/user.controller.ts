import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Req, Put, Param } from '@nestjs/common';
import { GetUserDto, UpdateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(':id')
	async getUserById(@Param('id') id: string) {
		const user = await this.userService.getUserById(id);
		return user;
	}

	@Put(':id')
	async modifyUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
		const user = await this.userService.modifyUser(id, body);
		return user;
	}

	@Get(':id/rooms')
	async getRooms(@Param('id') id: string) {
		const rooms = await this.userService.getRoomsByUser(id);
		return rooms;
	}

	@Get(':id/friends')
	async getFriends(@Param('id') id: string) {
		const friends = await this.userService.getFriendById(id);
		return friends;
	}
	
	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
