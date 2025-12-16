import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayGuard } from './gateway.guard';
import { GatewayInterceptor } from './gateway.interceptor';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN', 7 * 24 * 60 * 60),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GatewayGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GatewayInterceptor,
    },
  ],
  exports: [JwtModule],
})
export class GatewayModule {}
