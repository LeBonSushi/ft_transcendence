import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException, Logger, forwardRef, Inject } from '@nestjs/common';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationTemplates } from '@/modules/notifications/templates/templates';
import { NotificationType } from '@travel-planner/shared';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject (forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService
  ) {}

  async getRequestReceived(id: string) {
    const receivedRequest = await this.prisma.user.findUnique({
        where: { id: id },
        include: {
            receivedFriendRequests: true,
        }
    });

    return {friend_request: receivedRequest?.receivedFriendRequests};
  }

  async sendRequest(id: string, friendId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });
    const friend = await this.prisma.user.findUnique({ where: { id: friendId } });

    if (!user || !friend) {
      throw new NotFoundException('User not found');
    }

    const friendRequest = await this.prisma.friendship.create({
      data: {
        userId: id,
        friendId: friendId,
        status: 'PENDING',
      }
    });

    const notif = NotificationTemplates.getTemplate(NotificationType.FRIEND_REQUEST, {
        username: "test", title: "Friend request", friendId: friendRequest.id, toUserId:friendId
    });
    
    await this.notificationsService.createNotification(notif);

    return { success: true, friendRequest };
  }

  async acceptRequest(id: string, friendId: string) {
    const friend = await this.prisma.user.findUnique({
        where: { id: friendId}
    });

    if (!friend)
        throw new UnauthorizedException('Cannot add user that no exist');

    const acceptFriend = await this.prisma.friendship.updateMany({
        where: {
            userId: friendId,
            friendId: id,
            status: "PENDING",
        },
        data: {
            status: "ACCEPTED",
        }
    });

    if (acceptFriend.count === 0)
        throw new NotFoundException('No pending friend request found from this user');

    return { success: true };
  }

  async rejectRequest(id: string, friendId: string) {
    const rejected = await this.prisma.friendship.deleteMany({
        where: {
            userId: friendId,
            friendId: id,
            status: "PENDING",
        }
    });

    if (rejected.count === 0)
        throw new NotFoundException('No pending friend request found');

    return { success: true, message: 'Friend request rejected' };
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
            status: {
                in: [ "ACCEPTED", "BLOCKED" ]
            }
        }
    });

    if (deleteFriend.count === 0)
        throw new UnauthorizedException("Cannot delete a non friend user");

    return { succes: true, deleted: deleteFriend.count };
  }

  // Endpoint de test pour créer des demandes d'amis vers mon current user
  async addRequest(userId: string, friendId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const friend = await this.prisma.user.findUnique({ where: { id: friendId } });

    if (!user || !friend) {
      throw new NotFoundException('User not found');
    }

    const friendRequest = await this.prisma.friendship.create({
      data: {
        userId: friendId,
        friendId: userId,
        status: 'PENDING',
      }
    });

    return { success: true, friendRequest };
  }
}