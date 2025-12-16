import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
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

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
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

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateOAuthUser(
    provider: string,
    oauthId: string,
    email: string,
    firstName: string,
    lastName: string,
    profilePicture?: string
  ) {
    // Try to find existing user by OAuth credentials
    let user = await this.prisma.user.findFirst({
      where: {
        oauthProvider: provider,
        oauthId: oauthId,
      },
      include: {
        profile: true,
      },
    });

    // If not found, try to find by email
    if (!user && email) {
      user = await this.prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      // Update existing user with OAuth credentials
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: provider,
            oauthId: oauthId,
          },
          include: {
            profile: true,
          },
        });
      }
    }

    // Create new user if not found
    if (!user) {
      const username = email.split('@')[0] + Math.random().toString(36).substr(2, 4);
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          oauthProvider: provider,
          oauthId: oauthId,
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
    }

    return user;
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

	const accessToken = await this.jwtService.signAsync(payload, {
		expiresIn: parseInt(this.config.get<string>('JWT_EXPIRES_IN_SECOND', '900'), 10),
	});

	const refreshToken = await this.jwtService.signAsync(payload, {
		expiresIn: parseInt(this.config.get<string>('JWT_REFRESH_TIME_SECOND', '604800'), 10),
	});

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(this.config.get<string>('JWT_EXPIRES_IN_SECOND', '900'), 10),
    };
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
