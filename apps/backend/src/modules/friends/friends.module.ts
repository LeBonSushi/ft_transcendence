import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { FriendsService } from './friends.service';
import { RoomsModule } from '@/modules/rooms/rooms.module';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    forwardRef(() => RoomsModule),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
