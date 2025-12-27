import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GatewayGuard } from './gateway.guard';
import { GatewayInterceptor } from './gateway.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
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
})
export class GatewayModule {}
