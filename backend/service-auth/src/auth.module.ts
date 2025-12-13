import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './services/prisma.service';
import { JwtService } from './services/jwt.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, JwtService],
	exports: [PrismaService],
})
export class AuthModule {}
