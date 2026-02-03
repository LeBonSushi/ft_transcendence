import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { env } from '@/common/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Middleware
  app.use(cookieParser());

  // API prefix
  app.setGlobalPrefix('api');

  const port = env.BACKEND_PORT;
  await app.listen(port);

  console.log(`🚀 Backend is running on http://localhost:${port}`);
  console.log(`📡 WebSocket server is available on ws://localhost:${port}`);
}

bootstrap();
