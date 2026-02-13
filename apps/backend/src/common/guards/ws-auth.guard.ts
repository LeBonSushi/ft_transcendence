import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  static async validateToken(client: Socket): Promise<void> {
    const jwtSecret = process.env.NEXTAUTH_SECRET;

    // Mode dev sans auth
    if (!jwtSecret) {
      const mockAuthId = client.handshake.auth?.userId;
      const mockHeaderId = client.handshake.headers['x-mock-user-id'];
      const effectiveId = (mockAuthId as string) || (mockHeaderId as string) || 'user_test_jane_001';
      console.log(`WS DEV MODE: Mock user injected (${effectiveId})`);
      client.data.user = {
        id: effectiveId,
        username: 'DevUser_' + effectiveId,
        email: 'test@example.com',
      };
      return;
    }

    // Extraire le token
    const token = WsAuthGuard.extractTokenFromSocket(client);
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      client.data.user = { 
        id: decoded.sub || decoded.id, 
        email: decoded.email, 
        username: decoded.username 
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    if (client.data.user)
        return true;
    await WsAuthGuard.validateToken(client);
    return true;
  }

  private static extractTokenFromSocket(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const tokenFromQuery = client.handshake.auth?.token || client.handshake.query?.token;
    if (typeof tokenFromQuery === 'string') {
      return tokenFromQuery;
    }

    return undefined;
  }
}
