import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const cookies = this.parseCookies(client.handshake.headers.cookie || '');

      // Try access_token first
      let token = cookies.access_token;
      let payload: any;

      try {
        if (token) {
          payload = await this.jwtService.verifyAsync(token, {
            secret: this.config.get<string>('JWT_SECRET', 'default_jwt_secret'),
          });
        }
      } catch (error) {
        // Access token invalid or expired, try refresh token
        token = cookies.refresh_token;
        if (!token) {
          throw new UnauthorizedException('No valid token provided');
        }

        payload = await this.jwtService.verifyAsync(token, {
          secret: this.config.get<string>('JWT_SECRET', 'default_jwt_secret'),
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to socket data
      const { passwordHash, ...sanitizedUser } = user;
      client.data.user = sanitizedUser;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });

    return cookies;
  }
}
