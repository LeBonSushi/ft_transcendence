import { Module } from '@nestjs/common';
import { AuthGatewayController } from './controllers/auth.gateway.controller';
import { UserGatewayController } from './controllers/user.gateway.controller';
import { ChatGatewayController } from './controllers/chat.gateway.controller';
import { GameGatewayController } from './controllers/game.gateway.controller';
import { ProxyService } from './services/proxy.service';

@Module({
	controllers: [
		AuthGatewayController,
		UserGatewayController,
		ChatGatewayController,
		GameGatewayController,
	],
	providers: [ProxyService],
})
export class AppModule {}
