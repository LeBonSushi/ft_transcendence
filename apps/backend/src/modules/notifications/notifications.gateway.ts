import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import { NotificationsService } from './notifications.service';
// import { NotificationModel, } from './templates/type';
import { Socket } from 'socket.io';
import {CreateNotificationDto, Notification} from "@travel-planner/shared"

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private notificationsService: NotificationsService) { }

  async handleConnection(client: Socket) {
    try {
      console.log(`Client connected: ${client.id}`);
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

  // @UseGuards(WsAuthGuard) // a remettre
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
  async sendNotif(@ConnectedSocket() client: Socket, @MessageBody() data: { targetUserId: string, notification: CreateNotificationDto })
  {
    if (!data.targetUserId) {
      client.emit('error', { message: 'targetUserId manquant' });
      return;
    }
    const roomName = `user:${data.targetUserId}:notifications`
    const notif = await this.notificationsService.createNotification(data.targetUserId, data.notification)
    this.server.to(roomName).emit('newNotification', notif)
  }

  // async sendNotificationToUser(userId:string, notification:NotificationModel)
  // {
  //   const roomName = `user:${userId}:notifications`
  //   const notif = await this.notificationsService.createNotification(userId,notification)
  //   this.server.to(roomName).emit('newNotifications', notification)
  //   //envoyer notif a newnotif
  // }
}
