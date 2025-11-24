import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'tsconfig-paths/register';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.BACKEND_PORT ?? 3001);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
