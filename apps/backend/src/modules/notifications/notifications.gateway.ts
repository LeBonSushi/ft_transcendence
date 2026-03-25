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
import { WsAuthGuard } from '@/common/guards/ws-auth.guard';
import { RedisService } from '@/common/redis/redis.service';
import { SOCKET_EVENTS } from '@travel-planner/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true, // the url for origin must be specified, it can't be *
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
    this.redis.subscriber.psubscribe('user:*:notifications'); // we listen to the notif channel, every notif
    this.redis.subscriber.on('pmessage', (_pattern, channel, message) => { // pattern : user:*:notifications in thsi case : user:454646:notifications, message : the data
      const roomName = channel;
      const notif = JSON.parse(message);
      this.server.to(roomName).emit(SOCKET_EVENTS.NOTIFICATION_NEW, notif);
    });
    console.log('Notifications gateway subscribed to Redis');
  }

  async handleConnection(client: Socket) { // method called during each connection
    try {
      await WsAuthGuard.validateToken(client); //verification of the JWT
      console.log(`Client connected: ${client.id} (user: ${client.data.user.id})`); // the client id is set from the JWT in the ws-auth file
    } catch (error) {
      console.log(`Client rejected: ${client.id} - ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.NOTIFICATION_SUBSCRIBE)
  async handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const roomName = `user:${userId}:notifications`
    client.join(roomName)
    console.log(`User ${userId} subscribed to notifications`)
  }


  @SubscribeMessage(SOCKET_EVENTS.NOTIFICATION_UNREAD)
  async handleGetUnreadNotifications(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.user.id;
      const notifications = await this.notificationsService.getUnreadNotification(userId)
      client.emit(SOCKET_EVENTS.NOTIFICATION_UNREAD, notifications)
    }
    catch (error) {
      console.error("Error getUnreadNotifications:", error)
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.NOTIFICATION_READ)
  async handleReadNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { notifId: string }) {
    try {
      const userId = client.data.user.id;
      if (!data.notifId) {
        console.log("Missing notifId")
        return;
      }
      await this.notificationsService.ChangeNotificationToRead(userId, data.notifId)
    }
    catch (error) {
      console.error("Error readnotification:", error)
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.NOTIFICATION_ANSWER)
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

}
