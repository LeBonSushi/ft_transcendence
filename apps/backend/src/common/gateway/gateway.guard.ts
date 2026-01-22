import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class GatewayGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

        // ============================================================
    // AJOUT : BACKDOOR POUR LE DÉVELOPPEMENT LOCAL
    // ============================================================
    // On vérifie si on est en dev ET si le header spécial est présent
    // Note: Assurez-vous que process.env.NODE_ENV n'est pas 'production'
    const mockUserId = request.headers['x-mock-user-id'];
    
    if (mockUserId && process.env.NODE_ENV !== 'production') {
      // On injecte manuellement l'utilisateur dans la requête
      request.user = {
        id: mockUserId, // L'ID que vous avez envoyé dans le header
        email: 'mock@test.com',
        username: 'MockUser',
        clerkId: mockUserId,
      };
      console.log(`🔓 DEV MODE: Mock user injected (${mockUserId})`);
      return true; // On laisse passer sans vérifier Clerk
    }
    // ============================================================

    const token = this.extractTokenFromRequest(request);

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

      // Attacher les infos utilisateur à la requête
      request['user'] = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
        clerkId: clerkUser.id,
      };
    } catch (error) {
      console.error('Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Check Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies (for session-based auth)
    const cookieToken = request.cookies?.['access_token'];
    if (cookieToken) {
      return cookieToken;
    }

    return undefined;
  }
}
