import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsClerkGuard } from '@/common/guards/ws-clerk.guard';
import { NotificationsService } from './notifications.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { NotificationModel } from './templates/type';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})

export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private notificationsService: NotificationsService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribetToNotifications')
  async handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const roomName = `user:${data.userId}:notifications`
    client.join(roomName)
    console.log("User just subscribed")
  }

  // @UseGuards(WsClerkGuard) // a remettre
  @SubscribeMessage('getNotifications')
  async handleGetNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    try {

      if (!data.userId) {
        client.emit('error', { message: 'userId manquant' });
        return;
      }
      console.log("heyyy")
      const notifications = await this.notificationsService.getNotification(data.userId)
      client.emit('notifications', notifications)
    }
    catch (error) {
      console.error("Error notif")
    }
  }

  @SubscribeMessage('sendNotif')
  async sendNotif(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string, notification: NotificationModel })
  {
    const roomName = `user:${data.userId}:notifications`
    const notif = await this.notificationsService.createNotification(data.userId,data.notification)
    this.server.to(roomName).emit('newNotifications', data.notification)
    //envoyer notif a newnotif
  }

  // async sendNotificationToUser(userId:string, notification:NotificationModel)
  // {
  //   const roomName = `user:${userId}:notifications`
  //   const notif = await this.notificationsService.createNotification(userId,notification)
  //   this.server.to(roomName).emit('newNotifications', notification)
  //   //envoyer notif a newnotif
  // }
}
