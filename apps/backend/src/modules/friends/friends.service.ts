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

  async getRelations(id: string) {
    return this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: id }, { friendId: id }],
      },
      include: {
        user: { include: { profile: true } },
        friend: { include: { profile: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async sendRequest(id: string, friendId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });
    const friend = await this.prisma.user.findUnique({ where: { id: friendId } });

    if (!user || !friend) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: id, friendId: friendId },
          { userId: friendId, friendId: id },
        ],
      },
    });

    if (existing && existing.status === 'ACCEPTED')
      throw new NotFoundException('Already friends');

    if (existing && existing.status === 'PENDING' && existing.userId === friendId) {
      await this.prisma.friendship.update({
        where: { id: existing.id },
        data: { status: 'ACCEPTED' },
      });

      const notif = NotificationTemplates.getTemplate(NotificationType.FRIEND_ACCEPTED, {
        userName: user.username, toUserId: friendId
      });

      await this.notificationsService.createNotification(notif);

      return { success: true, autoAccepted: true };
    }

    if (existing)
      throw new NotFoundException('Friend request already exists');

    const friendRequest = await this.prisma.friendship.create({
      data: {
        userId: id,
        friendId: friendId,
        status: 'PENDING',
      }
    });

    const notif = NotificationTemplates.getTemplate(NotificationType.FRIEND_REQUEST, {
        username: user.username,  friendshipId: friendRequest.id, toUserId: friend.id
    });
    
    await this.notificationsService.createNotification(notif);

    return { success: true, friendRequest };
  }

  async acceptRequest(id: string, friendshipIdOrFriendId: string) {
    const friendship = await this.findFriendshipByTarget(id, friendshipIdOrFriendId);

    if (!friendship)
        throw new UnauthorizedException('Cannot add user that no exist');

    if (friendship.status !== 'PENDING' || friendship.friendId !== id)
      throw new NotFoundException('No pending friend request found from this user');

    const acceptFriend = await this.prisma.friendship.updateMany({
        where: {
            id: friendship.id,
            status: "PENDING",
        },
        data: {
            status: "ACCEPTED",
        }
    });

    if (acceptFriend.count === 0)
        throw new NotFoundException('No pending friend request found from this user');

    const acceptor = await this.prisma.user.findUnique({ where: { id } });
    if (acceptor) {
      const notif = NotificationTemplates.getTemplate(NotificationType.FRIEND_ACCEPTED, {
        userName: acceptor.username, toUserId: friendship.userId
      });
      await this.notificationsService.createNotification(notif);
    }

    return { success: true };
  }

  async rejectRequest(id: string, friendshipIdOrFriendId: string) {
    const friendship = await this.findFriendshipByTarget(id, friendshipIdOrFriendId);
    if (!friendship)
      throw new NotFoundException('No pending friend request found');

    if (friendship.status !== 'PENDING' || friendship.friendId !== id)
      throw new NotFoundException('No pending friend request found');

    const rejected = await this.prisma.friendship.deleteMany({
        where: {
          id: friendship.id,
          status: 'PENDING',
        }
    });

    if (rejected.count === 0)
        throw new NotFoundException('No pending friend request found');

    return { success: true, message: 'Friend request rejected' };
  }

  async blockRequest(id: string, friendshipIdOrFriendId: string) {
    const friendship = await this.findFriendshipByTarget(id, friendshipIdOrFriendId);
    if (!friendship)
      throw new UnauthorizedException("Cannot block a non friend user");

    const friends = await this.prisma.friendship.updateMany({
        where: { id: friendship.id,
            OR: [
                { userId: id},
                { friendId: id }
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

  async unblockRequest(id: string, friendshipIdOrFriendId: string) {
    const friendship = await this.findFriendshipByTarget(id, friendshipIdOrFriendId);
    if (!friendship)
      throw new UnauthorizedException("Cannot unblock a non friend user");

    const friendId = friendship.userId === id ? friendship.friendId : friendship.userId;

    const friends = await this.prisma.friendship.updateMany({
        where: {
            OR: [
                { userId: id, friendId: friendId },
                { userId: friendId, friendId: id }
            ],
            status: 'BLOCKED',
        },
        data: {
            status: "ACCEPTED",
        }
    });

    if (friends.count === 0)
        throw new UnauthorizedException("Cannot unblock a non friend user");

    return { succes: true, unblocked: friends.count };
  }

  async deleteFriend(id: string, friendshipIdOrFriendId: string) {
    const friendship = await this.findFriendshipByTarget(id, friendshipIdOrFriendId);
    if (!friendship)
      throw new UnauthorizedException("Cannot delete a non friend user");

    const friendId = friendship.userId === id ? friendship.friendId : friendship.userId;

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

  private async findFriendshipByTarget(userId: string, target: string) {
    return this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            id: target,
            OR: [{ userId }, { friendId: userId }],
          },
          {
            OR: [
              { userId, friendId: target },
              { userId: target, friendId: userId },
            ],
          },
        ],
      },
    });
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