import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsClerkGuard } from '@/common/guards/ws-clerk.guard';
// import { SOCKET_EVENTS } from "../../../../../packages/shared/src/constants/index"

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

  // afterInit(server: Server) {
  //   server.use(async (socket, next) => {
  //     try {
  //       console.log("SERVER_USE TRY");
  //       await WsClerkGuard.validateToken(socket);
  //       next();
  //     } catch (error) {
  //       console.log('Auth failed:', error.message);
  //       next(new Error('Unauthorized'));
  //     }
  //   });
  //   console.log('🔌 WebSocket Gateway initialized');
  // }

  async handleConnection(client: Socket) {
    // L'utilisateur est disponible dans client.data.user grâce au WsClerkGuard

    const user = client.data.user || client.id;
    const userIdentifier = client.data.user ? (client.data.user.username || client.data.user.id) : client.id;
    console.log(`User ${userIdentifier} connected to chat`);
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user || client.id;
    const userIdentifier = client.data.user ? (client.data.user.username || client.data.user.id) : client.id;
    console.log(`User ${userIdentifier} disconnected from chat`);
  }

  @SubscribeMessage("room:join")
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string}) {
    const user = client.data.user;
    console.log(`${user.username} joined room ${data.roomId}`);

    client.join(data.roomId);

    await this.chatService.userJoinedRoom(data.roomId, user.userId);

    client.to(data.roomId).emit("user:online", {
      userId: user.id, 
      username: user.username
    });
  }

  @SubscribeMessage("room:leave")
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string}) {
    const user = client.data.user;
    console.log(`${user.username} left room ${data.roomId}`);

    client.leave(data.roomId);

    await this.chatService.userLeftRoom(data.roomId, user.userId);

    client.to(data.roomId).emit("user:offline", {
      userId: user.id, 
      username: user.username
    });
  }

  @SubscribeMessage("messages:get")
  async handleGetMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string; limit?: number}) {
    const messages = await this.chatService.getRoomMessages(data.roomId, data.limit);

    client.emit("messages:history", messages);
  }

  @SubscribeMessage("message:send")
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string; content: string}) {
    const user = client.data.user;
    console.log(`Message from ${user.username} in room ${data.roomId}: "${data.content}"`);

    const message = await this.chatService.createMessage(data.roomId, user.id, data.content);

    this.server.to(data.roomId).emit("message:receive", message);

    console.log(`Message sent to room ${data.roomId}`);
  }

  @SubscribeMessage("message:delete")
  async handleDeleteMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {messageId: string; roomId: string}) {
    const user = client.data.user;
  
    try {
      await this.chatService.deleteMessage(data.messageId, user.id);
      this.server.to(data.roomId).emit("message:deleted", { messageId: data.messageId });
    } catch (error) {
      client.emit("error", { message: error.message });
    }
  }

  @SubscribeMessage("typing:start")
  async handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string}){
    const user = client.data.user;

    await this.chatService.setTyping(data.roomId, user.userId, true);

    client.to(data.roomId).emit("typing:start", {
      userId: user.id,
      username: user.username
    });
  }  


  @SubscribeMessage("typing:stop")
  async handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string}){
    const user = client.data.user;

    await this.chatService.setTyping(data.roomId, user.userId, false);
    
    client.to(data.roomId).emit("typing:stop", {
      userId: user.id,
      username: user.username
    });
  }  



}
