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
} from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { createClerkClient, ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

interface PublicUserResponse {
  id: string;
  username: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    bio: string | null;
  } | null;
}

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
    return this.usersService.getUserById(clerkId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteMe(@GetUser('clerkId') clerkId: string) {
    this.logger.log(`Attempting to delete user: ${clerkId}`);

    try {
      await this.clerkClient.users.deleteUser(clerkId);
      this.logger.log(`User deleted successfully: ${clerkId}`);
      return { success: true, message: 'Account deleted successfully' };
    } catch (error: any) {
      this.logger.error(`Failed to delete user ${clerkId}: ${error?.message || error}`);
      throw new HttpException(
        error?.errors?.[0]?.message || error?.message || 'Failed to delete account',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me/rooms')
  async getMyRooms(@GetUser('clerkId') clerkId: string) {
    return this.usersService.getRoomsByUser(clerkId);
  }

  @Put('me')
  async updateMe(@GetUser('clerkId') clerkId: string, @Body() body: UpdateUserDto) {
    return this.usersService.modifyUser(clerkId, body);
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
    @GetUser('clerkId') clerkId: string,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    if (clerkId !== id) {
      throw new HttpException('Not authorized to modify this user', HttpStatus.FORBIDDEN);
    }

    return this.usersService.modifyUser(id, body);
  }

  @Get(':id/rooms')
  async getRooms(@GetUser('clerkId') clerkId: string, @Param('id') id: string) {
    if (clerkId !== id) {
      throw new HttpException('Not authorized to view this user rooms', HttpStatus.FORBIDDEN);
    }

    return this.usersService.getRoomsByUser(id);
  }

  @Get(':id/friends')
  async getFriends(@GetUser('clerkId') clerkId: string, @Param('id') id: string) {
    // Only allow users to view their own friends
    if (clerkId !== id) {
      throw new HttpException('Not authorized to view this user friends', HttpStatus.FORBIDDEN);
    }

    return this.usersService.getFriendById(id);
  }

  @Get()
  getStatus() {
    return { status: 'Users service is running' };
  }
}
