import { Injectable } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class NotificationsService {
  constructor(private redis: RedisService) {}

  async sendNotification(userId: string, notification: any) {
    await this.redis.publish(
      `user:${userId}:notifications`,
      JSON.stringify(notification)
    );
  }

  // Add more notification logic as needed
}
