import { UsersService } from './users.service';
import { Controller, Body, Get, Put, Param, Delete, HttpCode, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { createClerkClient, ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  private clerkClient: ClerkClient;

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
    });
  }

  @Get('me')
  async getMe(@GetUser('clerkId') clerkId: string) {
    return await this.usersService.getUserById(clerkId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteMe(@GetUser('clerkId') clerkId: string) {
    this.logger.log(`Attempting to delete user: ${clerkId}`);

    try {
      // Supprimer l'utilisateur de Clerk (cela déclenchera le webhook user.deleted)
      await this.clerkClient.users.deleteUser(clerkId);
      this.logger.log(`User deleted successfully: ${clerkId}`);
      return { success: true, message: 'Account deleted successfully' };
    } catch (error: any) {
      this.logger.error(`Failed to delete user ${clerkId}:`, error?.message || error);
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new HttpException(
        error?.errors?.[0]?.message || error?.message || 'Failed to delete account',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('me/rooms')
  async getMyRooms(@GetUser('clerkId') clerkId: string) {
    return await this.usersService.getRoomsByUser(clerkId);
  }

  @Put('me')
  async updateMe(@GetUser('clerkId') clerkId: string, @Body() body: UpdateUserDto) {
    return await this.usersService.modifyUser(clerkId, body);
  }

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
