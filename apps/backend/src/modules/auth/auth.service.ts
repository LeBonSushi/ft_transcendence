import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { lucia } from '@/lib/lucia';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already in use');
      }
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return {
      user: this.sanitizeUser(user),
      sessionId: session.id,
      sessionCookie,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.usernameOrEmail }, { username: dto.usernameOrEmail }],
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return {
      user: this.sanitizeUser(user),
      sessionId: session.id,
      sessionCookie,
    };
  }

  async validateSession(sessionId: string) {
    const result = await lucia.validateSession(sessionId);

    if (!result.session || !result.user) {
      throw new UnauthorizedException('Invalid session');
    }

    return result;
  }

  async invalidateSession(sessionId: string) {
    await lucia.invalidateSession(sessionId);
  }

  async getOrCreateOAuthUser(
    provider: string,
    providerUserId: string,
    email: string,
    firstName: string,
    lastName: string,
    profilePicture?: string
  ) {
    // Try to find existing OAuth account
    const existingOAuthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (existingOAuthAccount) {
      return existingOAuthAccount.user;
    }

    // Try to find user by email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    // Link OAuth account to existing user
    if (existingUser) {
      await this.prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider,
          providerUserId,
        },
      });
      return existingUser;
    }

    // Create new user with OAuth account
    const username = email.split('@')[0] + Math.random().toString(36).substring(2, 6);
    const newUser = await this.prisma.user.create({
      data: {
        email,
        username,
        profile: {
          create: {
            firstName,
            lastName,
            profilePicture,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Create OAuth account separately
    await this.prisma.oAuthAccount.create({
      data: {
        userId: newUser.id,
        provider,
        providerUserId,
      },
    });

    return newUser;
  }

  async createSessionForUser(userId: string) {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return { session, sessionCookie };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
