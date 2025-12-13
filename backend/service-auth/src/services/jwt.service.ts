import { Injectable, OnModuleDestroy, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService implements OnModuleInit, OnModuleDestroy {
	
	constructor(
		private readonly jwtService: NestJwtService,
		private readonly configService: ConfigService,
	) {}


	onModuleInit() {
		console.log('JwtService initialized');
	}

	onModuleDestroy() {
		console.log('JwtService destroyed');
	}

	async generateTokens(payload: any): Promise<JwtTokens> {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_SECRET'),
				expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 15 * 60 * 1000),
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
				expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 7 * 24 * 60 * 60 * 1000),
			}),
		]);

		return { accessToken, refreshToken };
	}

	async validateAccessToken(token: string): Promise<any> {
		try {
			return await this.jwtService.verifyAsync(token, {
				secret: this.configService.get<string>('JWT_SECRET'),
			});
		} catch (e) {
			throw new UnauthorizedException('Invalid access token');
		}
	}

	async validateRefreshToken(token: string): Promise<any> {
		try {
			return await this.jwtService.verifyAsync(token, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			});
		} catch (e) {
			throw new UnauthorizedException('Invalid refresh token');
		}
	}
}