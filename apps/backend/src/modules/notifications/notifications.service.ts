import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';
import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateNotificationDto, NotificationType } from '@travel-planner/shared';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class NotificationsService {
  constructor(
    private redis: RedisService,
    private Prisma: PrismaService,
    @Inject(forwardRef(() => FriendsService))
    private friendsService: FriendsService,
  ) { }

  async createNotification(notificationTemplate: CreateNotificationDto) {
    if (!notificationTemplate.toUserId)
      return
    const notif = await this.Prisma.notification.create({
      data: {
        userId: notificationTemplate.toUserId,
        title: notificationTemplate.title,
        message: notificationTemplate.message,
        type: notificationTemplate.type,
        friendshipId: notificationTemplate.friendshipId
      }
    })

    await this.redis.publish(
      `user:${notificationTemplate.toUserId}:notifications`,
      JSON.stringify(notif)
    );
    return notif
  }

  async sendNotificationToRoom(notificationTemplate: CreateNotificationDto) {
    if (!notificationTemplate.toRoomId) {
      return
    }
    const usersInRoom = await this.Prisma.roomMember.findMany(
      {
        where: { roomId: notificationTemplate.toRoomId },
        select: { userId: true }
      },
    )

    await Promise.all(
      usersInRoom.map((user) => {
        const notif = { ...notificationTemplate, toUserId: user.userId }
        return this.createNotification(notif)
      }))

    return
  }

  async getUnreadNotification(userId: string) {
    const unreadNotifictions = await this.Prisma.notification.findMany({
      where: {
        userId: userId,
        read: false
      }, orderBy: { createdAt: 'desc' }
    })
    return unreadNotifictions
  }

  async ChangeNotificationToRead(userId: string, notifId: string) {
    await this.Prisma.notification.update({
      where: {
        userId: userId,
        id: notifId,
      },
      data: {
        read: true
      }
    })
  }

  async AnswerToNotification(userId: string, notifId: string, answer: boolean) {
    const notif = await this.Prisma.notification.update({
      where: {
        userId: userId,
        id: notifId,
      },
      data: {
        read: true,
        request_accepted: answer
      }
    })
    if (notif.request_accepted === true && notif.type === NotificationType.FRIEND_REQUEST
      && notif.friendshipId) {
      await this.friendsService.acceptRequest(userId, notif.friendshipId)
    }

    else if (notif.request_accepted === false && notif.type === NotificationType.FRIEND_REQUEST
      && notif.friendshipId) {
      await this.friendsService.rejectRequest(userId, notif.friendshipId)
    }
  }
}
