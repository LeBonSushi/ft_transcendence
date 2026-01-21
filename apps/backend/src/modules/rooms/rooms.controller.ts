import { Controller, Post, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CreateRoomDto } from './dto/room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  async createRoom(@GetUser('clerkId') userId: string, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(userId, createRoomDto);
  }
}
