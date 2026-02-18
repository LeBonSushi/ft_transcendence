import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
  exports: [RoomsService],
})
export class RoomsModule {}
