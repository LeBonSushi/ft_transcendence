import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createClerkClient, verifyToken, ClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private clerkClient: ClerkClient | null = null;
  private clerkSecretKey: string | undefined;

  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {
    this.clerkSecretKey = this.config.get<string>('CLERK_SECRET_KEY');

    if (this.clerkSecretKey) {
      this.clerkClient = createClerkClient({
        secretKey: this.clerkSecretKey,
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!this.clerkSecretKey || !this.clerkClient) {
      this.logger.error('Clerk is not configured - missing CLERK_SECRET_KEY');
      throw new UnauthorizedException('Authentication service not configured');
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const verified = await verifyToken(token, {
        secretKey: this.clerkSecretKey,
      });

      const clerkUser = await this.clerkClient.users.getUser(verified.sub);

      request.user = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress,
        clerkId: clerkUser.id,
      };

      return true;
    } catch (error: any) {
      if (error.reason === 'TokenExpired') {
        this.logger.debug('Token expired');
        throw new UnauthorizedException('Token expired');
      }

      if (error.reason === 'TokenInvalid') {
        this.logger.debug('Invalid token format');
        throw new UnauthorizedException('Invalid token');
      }

      this.logger.error(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
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
