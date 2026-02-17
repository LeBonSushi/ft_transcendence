import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { Socket } from 'socket.io';
import { CreateNotificationDto } from "@travel-planner/shared"
import { WsAuthGuard } from '@/common/guards/ws-auth.guard';
import { RedisService } from '@/common/redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})

@UseGuards(WsAuthGuard)
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private notificationsService: NotificationsService,
    private redis: RedisService,
  ) {}

  afterInit() {
    this.redis.subscriber.psubscribe('user:*:notifications');
    this.redis.subscriber.on('pmessage', (_pattern, channel, message) => {
      const roomName = channel;
      const notif = JSON.parse(message);
      this.server.to(roomName).emit('newNotification', notif);
    });
    console.log('Notifications gateway subscribed to Redis');
  }

  async handleConnection(client: Socket) {
    try {
      await WsAuthGuard.validateToken(client);
      console.log(`Client connected: ${client.id} (user: ${client.data.user.id})`);
    } catch (error) {
      console.log(`Client rejected: ${client.id} - ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToNotifications')
  async handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const roomName = `user:${userId}:notifications`
    client.join(roomName)
    console.log(`User ${userId} subscribed to notifications`)
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.user.id;
      const notifications = await this.notificationsService.getNotification(userId)
      client.emit('notifications', notifications)
    }
    catch (error) {
      console.error("Error getNotifications:", error)
    }
  }

  @SubscribeMessage('getUnreadNotifications')
  async handleGetUnreadNotifications(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.user.id;
      const notifications = await this.notificationsService.getUnreadNotification(userId)
      client.emit('notifications', notifications)
    }
    catch (error) {
      console.error("Error getUnreadNotifications:", error)
    }
  }

  @SubscribeMessage('readnotification')
  async handleReadNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { notifId: string }) {
    try {
      const userId = client.data.user.id;
      if (!data.notifId) {
        client.emit('error', { message: 'notifId manquant' });
        return;
      }
      await this.notificationsService.ChangeNotificationToRead(userId, data.notifId)
    }
    catch (error) {
      console.error("Error readnotification:", error)
    }
  }

  @SubscribeMessage('answernotification')
  async handleAnsweredNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { notifId: string, answer: boolean }) {
    try {
      const userId = client.data.user.id;
      if (!data.notifId) {
        client.emit('error', { message: 'notifId manquant' });
        return;
      }
      await this.notificationsService.AnswerToNotification(userId, data.notifId, data.answer)
    }
    catch (error) {
      console.error("Error answernotification:", error)
    }
  }

  @SubscribeMessage('sendNotif')
  async sendNotif(@ConnectedSocket() _client: Socket, @MessageBody() data: { notification: CreateNotificationDto })
  {
    await this.notificationsService.createNotification(data.notification)
  }

}
