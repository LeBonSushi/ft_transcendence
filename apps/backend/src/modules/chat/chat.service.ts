import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async getRoomMessages(roomId: string, limit = 50) {
    return this.prisma.message.findMany({
      where: { roomId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async createMessage(roomId: string, senderId: string, content: string, type: 'TEXT' | 'IMAGE' | 'SYSTEM' = 'TEXT') {
    const message = await this.prisma.message.create({
      data: {
        roomId,
        senderId,
        content,
        type,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Publish to Redis for real-time distribution across instances
    await this.redis.publish(
      `room:${roomId}:messages`,
      JSON.stringify({
        type: 'new_message',
        data: message,
      })
    );

    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  // Real-time presence tracking
  async userJoinedRoom(roomId: string, userId: string) {
    await this.redis.set(`presence:${roomId}:${userId}`, 'online', 300); // 5 min TTL
    await this.redis.publish(
      `room:${roomId}:presence`,
      JSON.stringify({
        type: 'user_joined',
        userId,
        timestamp: new Date(),
      })
    );
  }

  async userLeftRoom(roomId: string, userId: string) {
    await this.redis.del(`presence:${roomId}:${userId}`);
    await this.redis.publish(
      `room:${roomId}:presence`,
      JSON.stringify({
        type: 'user_left',
        userId,
        timestamp: new Date(),
      })
    );
  }

  async setTyping(roomId: string, userId: string, isTyping: boolean) {
    const key = `typing:${roomId}:${userId}`;
    if (isTyping) {
      await this.redis.set(key, '1', 5); // 5 sec TTL
    } else {
      await this.redis.del(key);
    }

    await this.redis.publish(
      `room:${roomId}:typing`,
      JSON.stringify({
        type: isTyping ? 'typing_start' : 'typing_stop',
        userId,
      })
    );
  }
}
