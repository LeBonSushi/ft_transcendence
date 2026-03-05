import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { AvailabilityService } from './availability.service';
import { PlanningService } from './planning.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, AvailabilityService, PlanningService],
  exports: [RoomsService],
})
export class RoomsModule {}
