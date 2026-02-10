import { Controller, Logger, Get, Post, Param, Delete} from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('friends')
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);
    
  constructor(private friendsService: FriendsService) {}

  @Get()
    getStatus() {
        return { status: 'Users service is running' };
  }

  @Get('request')
  async getRequestReceived(@GetUser('id') id: string) {
    return await this.friendsService.getRequestReceived(id);
  }

  @Post('request/:friendId')
  async sendFriendRequest(@GetUser('id') id: string, @Param('friendId') friendId: string) {
    return await this.friendsService.sendRequest(id, friendId);
  }

  @Post('accept/:friendId')
  async acceptRequest(@GetUser('id') id: string, @Param('friendId') friendId: string) {
    return await this.friendsService.acceptRequest(id, friendId);
  }

  @Post('reject/:friendId')
  async rejectRequest(@GetUser('id') id: string, @Param('friendId') friendId: string) {
    return await this.friendsService.rejectRequest(id, friendId);
  }

  @Post('block/:friendId')
  async blockRequest(@GetUser('id') id: string, @Param('friendId') friendId: string) {
    return await this.friendsService.blockRequest(id, friendId);
  }

  @Post('unblock/:friendId')
  async unblockRequest(@GetUser('id') id: string, @Param('friendId') friendId: string) {
    return await this.friendsService.unblockRequest(id, friendId);
  }

  @Delete('/:friendId')
  async deleteRequest(@GetUser('id') id: string, @Param('friendId') friendId: string) {
    return await this.friendsService.deleteFriend(id, friendId);
  }

  @Post('test/:userId/:friendId')
  async addrequest(@Param('userId') userId: string, @Param('friendId') friendId: string) {
    return await this.friendsService.addRequest(userId, friendId);
  }
}