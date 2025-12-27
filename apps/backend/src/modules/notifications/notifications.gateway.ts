import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import { WsClerkGuard } from '@/common/guards/ws-clerk.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(WsClerkGuard)
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
}
