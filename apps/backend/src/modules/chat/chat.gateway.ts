import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsClerkGuard } from '@/common/guards/ws-clerk.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(WsClerkGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // L'utilisateur est disponible dans client.data.user grâce au WsClerkGuard

    const user = client.id;
    console.log(`User ${user} connected to chat`);
  }

  handleDisconnect(client: Socket) {
    const user = client.id;
    if (user) {
      console.log(`User ${user} disconnected from chat`);
    }
  }
}
