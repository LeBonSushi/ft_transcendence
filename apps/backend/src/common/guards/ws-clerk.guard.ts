import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { createClerkClient, verifyToken } from '@clerk/backend';

@Injectable()
export class WsClerkGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  static async validateToken(client: Socket): Promise<void> {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    // Mode dev sans Clerk
    if (!clerkSecretKey) {
      const mockAuthId = client.handshake.auth?.userId;
      const mockHeaderId = client.handshake.headers['x-mock-user-id'];
      const effectiveId = (mockAuthId as string) || (mockHeaderId as string) || 'user_test_jane_001';
      console.log(`🔓 WS DEV MODE: Mock user injected (${effectiveId})`);
      client.data.user = {
        id: effectiveId,
        username: 'DevUser_' + effectiveId,
        email: 'test@example.com',
      };
      return;
    }

    // Extraire le token
    const token = WsClerkGuard.extractTokenFromSocket(client);
    if (!token) {
      throw new Error('No token provided');
    }

    const verified = await verifyToken(token, { secretKey: clerkSecretKey });
    const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
    const clerkUser = await clerkClient.users.getUser(verified.sub);

    client.data.user = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
      clerkId: clerkUser.id,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    if (client.data.user)
        return true;
    await WsClerkGuard.validateToken(client);
    return true;
  }

  private static extractTokenFromSocket(client: Socket): string | undefined {
    // Essayer d'extraire le token depuis les headers d'authentification
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Essayer d'extraire le token depuis les query params (fallback)
    const tokenFromQuery = client.handshake.auth?.token || client.handshake.query?.token;
    if (typeof tokenFromQuery === 'string') {
      return tokenFromQuery;
    }

    return undefined;
  }
}
