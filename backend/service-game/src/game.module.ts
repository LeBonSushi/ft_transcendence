import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from './prisma.service';

@Module({
	imports: [],
	controllers: [GameController],
	providers: [GameService, PrismaService],
	exports: [PrismaService],
})
export class GameModule {}
