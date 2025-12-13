import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthGatewayController } from './controllers/auth.gateway.controller';
import { UserGatewayController } from './controllers/user.gateway.controller';
import { ChatGatewayController } from './controllers/chat.gateway.controller';
import { GameGatewayController } from './controllers/game.gateway.controller';
import { ProxyService } from './services/proxy.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
	controllers: [
		AuthGatewayController,
		UserGatewayController,
		ChatGatewayController,
		GameGatewayController,
	],
	providers: [ProxyService, AuthMiddleware],
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'defaultSecret',
			signOptions: { expiresIn: '1h' },
		}),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.exclude(
				{ path: 'auth/login', method: RequestMethod.POST },
				{ path: 'auth/register', method: RequestMethod.POST },
				{ path: 'auth', method: RequestMethod.GET },
			)
			.forRoutes('*');
	}
}
