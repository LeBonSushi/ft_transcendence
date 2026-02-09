import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class GatewayGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      // TODO: Verify JWT token with your auth system
      // const decoded = jwt.verify(token, this.configService.get('JWT_SECRET'));
      // request['user'] = { id: decoded.sub, email: decoded.email, username: decoded.username };

      throw new UnauthorizedException('Gateway auth guard not yet implemented - replace with your JWT verification');
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const cookieToken = request.cookies?.['access_token'];
    if (cookieToken) {
      return cookieToken;
    }

    return undefined;
  }
}
