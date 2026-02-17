import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';
import { PrismaService } from '@/common/prisma/prisma.service';

import { Notification, CreateNotificationDto, NotificationType } from '@travel-planner/shared';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class NotificationsService {
  constructor(private redis: RedisService, 
    private Prisma:PrismaService,
    @Inject (forwardRef(() => FriendsService))
    private friendsService: FriendsService) {}

  async createNotification(notificationtemplate:CreateNotificationDto ) {
    const notif = await this.Prisma.notification.create({
      data : {
        userId:notificationtemplate.toUserId,
        title:notificationtemplate.title,
        message:notificationtemplate.message,
        type:notificationtemplate.type,
        friendshipId: notificationtemplate.friendshipId
      }
    })

    await this.redis.publish(
      `user:${notificationtemplate.toUserId}:notifications`,
      JSON.stringify(notif)
    )
    return notif
  }

  async getNotification(userId:string)
  {
    const res = await this.Prisma.notification.findMany({
      where: {
        userId: userId,
      }, orderBy: {createdAt: 'desc'}
    })
    return res
  }

  async getUnreadNotification(userId:string)
  {
    const res = await this.Prisma.notification.findMany({
      where: {
        userId: userId,
        read:false
      }, orderBy: {createdAt: 'desc'}
    })
    return res
  }

  async ChangeNotificationToRead(userId:string, notifId:string)
  {
    await this.Prisma.notification.update({
      where: {
        userId: userId,
        id:notifId,
      },
      data: {
        read:true
      }
    })
  }

  async AnswerToNotification(userId:string, notifId:string, answer:boolean)
  {
    const notif = await this.Prisma.notification.update({
      where: {
        userId: userId,
        id:notifId,
      },
      data: {
        read:true,
        request_accepted:answer
      }
    })
    if (notif.request_accepted === true && notif.type === NotificationType.FRIEND_REQUEST
      && notif.friendshipId )
    {
      await this.friendsService.acceptRequest(userId, notif.friendshipId)
    }
  }
}
