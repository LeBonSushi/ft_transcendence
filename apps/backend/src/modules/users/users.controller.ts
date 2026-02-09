import { UsersService } from './users.service';
import {
  Controller,
  Body,
  Get,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  HttpException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { UpdateUserDto, PublicUserResponse } from './dto/user.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';


@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@GetUser('id') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteMe(@GetUser('id') userId: string) {
    this.logger.log(`Attempting to delete user: ${userId}`);

    try {
      await this.usersService.deleteUser(userId);
      this.logger.log(`User deleted successfully: ${userId}`);
      return { success: true, message: 'Account deleted successfully' };
    } catch (error: any) {
      this.logger.error(`Failed to delete user ${userId}: ${error?.message || error}`);
      throw new HttpException(
        error?.message || 'Failed to delete account',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me/rooms')
  async getMyRooms(@GetUser('id') userId: string) {
    return this.usersService.getRoomsByUser(userId);
  }

  @Put('me')
  async updateMe(@GetUser('id') userId: string, @Body() body: UpdateUserDto) {
    return this.usersService.modifyUser(userId, body);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<PublicUserResponse> {
    const user = await this.usersService.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            profilePicture: user.profile.profilePicture,
            bio: user.profile.bio,
          }
        : null,
    };
  }

  @Put(':id')
  async modifyUser(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    if (userId !== id) {
      throw new HttpException('Not authorized to modify this user', HttpStatus.FORBIDDEN);
    }

    return this.usersService.modifyUser(id, body);
  }

  @Get(':id/rooms')
  async getRooms(@GetUser('id') userId: string, @Param('id') id: string) {
    if (userId !== id) {
      throw new HttpException('Not authorized to view this user rooms', HttpStatus.FORBIDDEN);
    }

    return this.usersService.getRoomsByUser(id);
  }

  @Get(':id/friends')
  async getFriends(@GetUser('id') userId: string, @Param('id') id: string) {
    // Only allow users to view their own friends
    if (userId !== id) {
      throw new HttpException('Not authorized to view this user friends', HttpStatus.FORBIDDEN);
    }

    return this.usersService.getFriend(id);
  }

  @Post(':id/:friendRequest')
  async sendFriendRequest(@GetUser('clerkId') clerkId: string, @Param('id') id: string, @Param('friendRequest') friendId :string) {
	if (clerkId !== id)
      throw new HttpException('Not authorized to view this user friends', HttpStatus.FORBIDDEN);
	
	return await this.usersService.sendFriendRequest(clerkId, friendId);
  }

  @Get()
  getStatus() {
    return { status: 'Users service is running' };
  }
}
