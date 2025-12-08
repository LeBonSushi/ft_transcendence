import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import { GameService } from './game.service';

@Controller('game')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class GameController {
	constructor(private readonly gameService: GameService) {}
	@Get()
	getStatus() {
		return { status: 'Game service is running' };
	}
}
