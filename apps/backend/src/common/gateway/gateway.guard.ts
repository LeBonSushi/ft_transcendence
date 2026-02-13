import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class GatewayGuard implements CanActivate {
  private readonly logger = new Logger(GatewayGuard.name);

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

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const jwtSecret = process.env.NEXTAUTH_SECRET;

      if (!jwtSecret) {
        this.logger.error('NEXTAUTH_SECRET is not configured');
        throw new UnauthorizedException('Server configuration error');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      request['user'] = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        username: decoded.username,
      };

      return true;
    } catch (error: any) {
      this.logger.error(`Token verification failed: ${error.message}`);
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
