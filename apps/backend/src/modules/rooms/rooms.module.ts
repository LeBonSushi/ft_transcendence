import { forwardRef, Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { AvailabilityService } from './availability.service';
import { PlanningService } from './planning.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, AvailabilityService, PlanningService],
  exports: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
