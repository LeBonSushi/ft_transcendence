import { UsersService } from './users.service';
import { Controller, Body, Get, Put, Param } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

	@Get(':id')
	async getUserById(@Param('id') id: string) {
		const user = await this.usersService.getUserById(id);
		return user;
	}

	@Put(':id')
	async modifyUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
		const user = await this.usersService.modifyUser(id, body);
		return user;
	}

	@Get(':id/rooms')
	async getRooms(@Param('id') id: string) {
		return await this.usersService.getRoomsByUser(id);
	}

	@Get(':id/friends')
	async getFriends(@Param('id') id: string) {
		const friends = await this.usersService.getFriendById(id);
		return friends;
	}

	@Get()
	getStatus() {
		return { status: 'Auth service is running' };
	}
}
