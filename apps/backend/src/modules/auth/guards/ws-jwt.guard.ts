import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from '@/common/prisma/prisma.service';
import { lucia } from '@/lib/lucia';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const cookies = this.parseCookies(client.handshake.headers.cookie || '');

      const sessionId = cookies.auth_session;

      if (!sessionId) {
        throw new UnauthorizedException('No session provided');
      }

      const { session, user } = await lucia.validateSession(sessionId);

      if (!session || !user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true,
        },
      });

      if (!dbUser) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to socket data
      const { passwordHash, ...sanitizedUser } = dbUser;
      client.data.user = sanitizedUser;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
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
