import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { removeListener } from 'node:cluster';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(private prisma: PrismaService) {}

  async getRequestReceived(id: string) {
    const receivedRequest = await this.prisma.user.findMany({
        where: { id: id },
        include: {
            receivedFriendRequests: true,
        }
    });

    return receivedRequest;
  }

  // a finir
  async sendRequest(id: string, friendId: string) {
    const IsUserexist = await this.prisma.user.findUnique({
      where: { id: friendId }
    })

    if (!IsUserexist)
      throw new NotFoundException('user not found');

    const currentUser = await this.prisma.user.findUnique({
      where: { id: id },
      include: {
        sentFriendRequests: true,
        receivedFriendRequests: true,
      }
    })

    if (!currentUser)
      throw new NotFoundException('user not found');

    console.log("friend to add: ", IsUserexist, ", current user :", currentUser);
  }

  async acceptRequest(id: string, friendId: string) {
    const friend = await this.prisma.user.findUnique({
        where: { id: friendId}
    });

    if (!friend)
        throw new UnauthorizedException('Cannot add user that no exist');

    const createFriend = await this.prisma.friendship.create({
        data: {
            userId: friendId,
            friendId: id,
            status: "ACCEPTED",
        }
    });

    if (!createFriend)
        throw new InternalServerErrorException('Error creating friendship link in database');

    return { succes: true };
  }

  async rejectRequest(id: string, friendId: string) {
    const friend = await this.prisma.user.findMany({
        where: { id: id },
        include: {
            receivedFriendRequests: {
                where: { userId: friendId }
            }
        }
    })
  }

  async blockRequest(id: string, friendId: string) {
    const friends = await this.prisma.friendship.updateMany({
        where: {
            OR: [
                { userId: id, friendId: friendId },
                { userId: friendId, friendId: id }
            ],
        },
        data: {
            status: "BLOCKED",
        }
    });

    if (friends.count === 0)
        throw new UnauthorizedException("Cannot block a non friend user");

    return { succes: true, blocked: friends.count };
  }

  async unblockRequest(id: string, friendId: string) {
    const friends = await this.prisma.friendship.updateMany({
        where: {
            OR: [
                { userId: id, friendId: friendId },
                { userId: friendId, friendId: id }
            ],
        },
        data: {
            status: "ACCEPTED",
        }
    });

    if (friends.count === 0)
        throw new UnauthorizedException("Cannot unblock a non friend user");

    return { succes: true, unblocked: friends.count };
  }

  async deleteFriend(id: string, friendId: string) {
    const deleteFriend = await this.prisma.friendship.deleteMany({
        where: {
            OR: [
                { userId: id, friendId: friendId },
                { userId: friendId, friendId: id }
            ],
            status: "ACCEPTED"
        }
    });

    if (deleteFriend.count === 0)
        throw new UnauthorizedException("Cannot delete a non friend user");

    return { succes: true, deleted: deleteFriend.count };
  }
}