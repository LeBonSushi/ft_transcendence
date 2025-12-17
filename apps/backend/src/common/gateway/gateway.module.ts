import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GatewayGuard } from './gateway.guard';
import { GatewayInterceptor } from './gateway.interceptor';

@Global()
@Module({
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
