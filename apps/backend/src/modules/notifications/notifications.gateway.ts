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

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})

export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
  
  constructor(private notificationsService: NotificationsService) {}
  
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // @UseGuards(WsClerkGuard)
  @SubscribeMessage('getNotifications')
  async handleGetNotifications(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string})
  {
    try{

      if (!data.userId) {
        client.emit('error', { message: 'userId manquant' });
        return;
      }
      console.log("heyyy")
      const notifications = await this.notificationsService.getNotification(data.userId)
      client.emit('notifications', notifications)
    }
    catch (error)
    {
      console.error("Error notif")
    }
  }


}
