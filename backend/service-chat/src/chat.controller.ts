import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/user.dto';
import { ChatService } from './chat.service';

@Controller('chat')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Get()
	getStatus() {
		return { status: 'Chat service is running' };
	}
}
