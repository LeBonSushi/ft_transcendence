import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.services';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, TwoFactorController],
  providers: [AuthService, TwoFactorService],
  exports: [AuthService, TwoFactorService],
})
export class AuthModule {}
