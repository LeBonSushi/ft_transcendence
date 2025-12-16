import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
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

  // Debug middleware
  app.use((req: any, _res: any, next: any) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers.cookie);
    next();
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get('BACKEND_PORT') || 4000;
  await app.listen(port);

  console.log(`🚀 Backend is running on http://localhost:${port}`);
  console.log(`📡 WebSocket server is available on ws://localhost:${port}`);
}

bootstrap();
