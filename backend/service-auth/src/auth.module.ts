import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [AuthService, PrismaService],
	exports: [PrismaService],
})
export class AuthModule {}
