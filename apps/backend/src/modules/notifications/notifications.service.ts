import { Injectable } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';
import {NotificationModel} from "./templates/type"
import { PrismaService } from '@/common/prisma/prisma.service';


@Injectable()
export class NotificationsService {
  constructor(private redis: RedisService, private Prisma:PrismaService) {}

  // async sendNotification(userId: string, notification: any) {
  //   await this.redis.publish(
  //     `user:${userId}:notifications`,
  //     JSON.stringify(notification)
  //   );
  // }

  async createNotification(userId: string, notificationtemplate:NotificationModel ) {
    const notif = await this.Prisma.notification.create({
      data : {
        userId,
        title:notificationtemplate.title,
        message:notificationtemplate.message,
        type:notificationtemplate.type
      }
    })

    await this.redis.publish(
      `user:${userId}:notifications`,
      JSON.stringify(notif)
    )
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

}
