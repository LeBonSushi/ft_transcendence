import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérifier si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Vérifier le token avec Clerk
      const clerkSecretKey = this.config.get<string>('CLERK_SECRET_KEY');

      if (!clerkSecretKey) {
        throw new UnauthorizedException('Clerk is not configured');
      }

      // Vérifier le token JWT de Clerk
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
      request.user = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
        clerkId: clerkUser.id,
      };

      return true;
    } catch (error) {
      console.error('Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
