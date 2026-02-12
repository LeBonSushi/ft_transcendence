import { Injectable } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';
import {NotificationModel} from "./templates/type"
import { PrismaService } from '@/common/prisma/prisma.service';


@Injectable()
export class NotificationsService {
  constructor(private redis: RedisService, private Prisma:PrismaService) {}

  async createNotification(userId: string, notificationtemplate:NotificationModel ) {
    const notif = await this.Prisma.notification.create({
      data : {
        userId,
        title:notificationtemplate.title,
        message:notificationtemplate.message,
        type:notificationtemplate.type,
        friendshipId: notificationtemplate.friendId
      }
    })

    await this.redis.publish(
      `user:${userId}:notifications`,
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
    await this.Prisma.notification.update({
      where: {
        userId: userId,
        id:notifId,
      },
      data: {
        read:true,
        request_accepted:answer
      }
    })
  }

}
