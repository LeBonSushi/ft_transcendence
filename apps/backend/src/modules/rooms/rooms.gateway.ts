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
import { PrismaService } from '@/common/prisma/prisma.service';
import { WsAuthGuard } from '@/common/guards/ws-auth.guard';
import { SOCKET_EVENTS } from '@travel-planner/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    try {
      if (!client.data.user) {
        await WsAuthGuard.validateToken(client);
      }

      const user = client.data.user;
      const userId = user?.id || user?.userId;
      if (!userId) {
        client.disconnect(true);
        return;
      }

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      console.log(`[RoomsGateway] User ${user?.username || userId} connected`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    const userId = user?.id || user?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
      console.log(`[RoomsGateway] User ${user.username || userId} disconnected`);
    }
  }

  // --- Subscription handlers ---

  @SubscribeMessage(SOCKET_EVENTS.ROOM_SUBSCRIBE)
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.user.id;

    const member = await this.prisma.roomMember.findFirst({
      where: { roomId: data.roomId, userId },
    });

    if (!member) {
      client.emit('error', { message: 'You are not a member of this room' });
      return;
    }

    client.join(`room:${data.roomId}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.ROOM_UNSUBSCRIBE)
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`room:${data.roomId}`);
  }

  // --- Emission helpers ---

  private emitToRoom(roomId: string, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  // Room
  emitRoomCreated(room: any) {
    this.emitToUser(room.creatorId, SOCKET_EVENTS.ROOM_CREATED, { room });
  }

  emitRoomUpdated(roomId: string, room: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.ROOM_UPDATED, { room });
  }

  emitRoomDeleted(roomId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.ROOM_DELETED, { roomId });
  }

  // Members
  emitMemberJoined(roomId: string, member: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.MEMBER_JOINED, { member });
  }

  emitMemberInvited(roomId: string, member: any, room: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.MEMBER_INVITED, { member });
    this.emitToUser(member.userId, SOCKET_EVENTS.ROOM_INVITED, { room });
  }

  emitMemberLeft(roomId: string, userId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.MEMBER_LEFT, { roomId, userId });
  }

  emitMemberKicked(roomId: string, userId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.MEMBER_KICKED, { roomId, userId });
  }

  emitMemberRoleUpdated(roomId: string, member: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.MEMBER_ROLE_UPDATED, { member });
  }

  // Availabilities
  emitAvailabilityCreated(roomId: string, availability: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.AVAILABILITY_CREATED, { availability });
  }

  emitAvailabilityUpdated(roomId: string, availability: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.AVAILABILITY_UPDATED, { availability });
  }

  emitAvailabilityDeleted(roomId: string, availabilityId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.AVAILABILITY_DELETED, { availabilityId });
  }

  // Proposals
  emitProposalCreated(roomId: string, proposal: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.PROPOSAL_CREATED, { proposal });
  }

  emitProposalUpdated(roomId: string, proposal: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.PROPOSAL_UPDATED, { proposal });
  }

  emitProposalDeleted(roomId: string, proposalId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.PROPOSAL_DELETED, { proposalId });
  }

  emitProposalSelected(roomId: string, proposal: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.PROPOSAL_SELECTED, { proposal });
  }

  // Votes
  emitVoteCreated(roomId: string, proposalId: string, vote: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.VOTE_CREATED, { proposalId, vote });
  }

  emitVoteUpdated(roomId: string, proposalId: string, vote: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.VOTE_UPDATED, { proposalId, vote });
  }

  emitVoteDeleted(roomId: string, proposalId: string, userId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.VOTE_DELETED, { proposalId, userId });
  }

  // Activities
  emitActivityCreated(roomId: string, proposalId: string, activity: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.ACTIVITY_CREATED, { proposalId, activity });
  }

  emitActivityUpdated(roomId: string, proposalId: string, activity: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.ACTIVITY_UPDATED, { proposalId, activity });
  }

  emitActivityDeleted(roomId: string, proposalId: string, activityId: string) {
    this.emitToRoom(roomId, SOCKET_EVENTS.ACTIVITY_DELETED, { proposalId, activityId });
  }

  emitMessageReceived(roomId: string, message: any) {
    this.emitToRoom(roomId, SOCKET_EVENTS.ROOM_LAST_MESSAGE_UPDATED, message);
  }
}
