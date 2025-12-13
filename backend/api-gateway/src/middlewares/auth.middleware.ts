import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async use(req: Request, res: Response, next: () => void) {
		const accessToken = req.cookies?.accessToken;
		const refreshToken = req.cookies?.refreshToken;

		if (accessToken) {
			try {
				const payload = await this.jwtService.verifyAsync(accessToken, {
					secret: this.configService.get<string>('JWT_SECRET', 'my_super_jwt')
				});

				req['user'] = payload;
				return next();
			}
			catch (e) {
				// ignore invalid token
			}
		}

		if (refreshToken) {
			try {
				const payload = await this.jwtService.verifyAsync(refreshToken, {
					secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'my_super_jwt_refresh')
				});

				const newAccessToken = await this.jwtService.signAsync({ userId: payload.userId, username: payload.username }, {
					secret: this.configService.get<string>('JWT_SECRET', 'my_super_jwt'),
					expiresIn: '15m',
				});

				res.cookie('accessToken', newAccessToken, {
						httpOnly: process.env.NODE_ENV === 'production',
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'strict',
						maxAge: 15 * 60 * 1000,
				});

				req['user'] = payload;
				return next();
			} catch (e) {
				throw new UnauthorizedException('Invalid or expired tokens');
			}
		}

	
		throw new UnauthorizedException('No access token provided');
	}
}
