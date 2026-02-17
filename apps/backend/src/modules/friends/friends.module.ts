import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { FriendsService } from './friends.service';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
