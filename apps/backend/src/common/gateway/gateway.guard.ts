import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { lucia } from '@/lib/lucia';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class GatewayGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

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
    const sessionId = this.extractSessionFromRequest(request);

    if (!sessionId) {
      throw new UnauthorizedException('No authentication session provided');
    }

    try {
      const { session, user } = await lucia.validateSession(sessionId);

      if (!session || !user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Attach user to request
      (request as any)['user'] = user;
      (request as any)['session'] = session;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return true;
  }

  private extractSessionFromRequest(request: Request): string | undefined {
    // Check Authorization header (Bearer token for API)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies (for browser-based auth)
    const sessionCookie = request.cookies?.['auth_session'];
    if (sessionCookie) {
      return sessionCookie;
    }

    return undefined;
  }
}
