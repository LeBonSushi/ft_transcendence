import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { createClerkClient, verifyToken } from '@clerk/backend';

@Injectable()
export class WsClerkGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromSocket(client);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

      if (!clerkSecretKey) {
        throw new UnauthorizedException('Clerk is not configured');
      }

      // Vérifier le token avec Clerk
      const verified = await verifyToken(token, {
        secretKey: clerkSecretKey,
      });

      // Créer le client Clerk pour récupérer les infos utilisateur
      const clerkClient = createClerkClient({
        secretKey: clerkSecretKey,
      });

      // Récupérer les informations utilisateur de Clerk
      const clerkUser = await clerkClient.users.getUser(verified.sub);

      // Attacher les infos utilisateur au socket
      client.data.user = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
        clerkId: clerkUser.id,
      };

      return true;
    } catch (error) {
      console.error('WebSocket Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromSocket(client: Socket): string | undefined {
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
