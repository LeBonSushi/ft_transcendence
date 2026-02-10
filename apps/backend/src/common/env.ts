import { config } from 'dotenv';
import { join } from 'path';

// Load .env from project root
config({ path: join(__dirname, '../../../../.env') });

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Check your .env file.`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  // Database
  DATABASE_URL: requiredEnv('DATABASE_URL'),

  // Clerk
  CLERK_SECRET_KEY: optionalEnv('CLERK_SECRET_KEY', ''),
  CLERK_WEBHOOK_SECRET: optionalEnv('CLERK_WEBHOOK_SECRET', ''),

  // Redis
  REDIS_HOST: optionalEnv('REDIS_HOST', 'localhost'),
  REDIS_PORT: optionalEnv('REDIS_PORT', '6379'),
  REDIS_PASSWORD: optionalEnv('REDIS_PASSWORD', ''),

  // Backend
  BACKEND_PORT: optionalEnv('BACKEND_PORT', '4000'),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  CORS_ORIGIN: optionalEnv('CORS_ORIGIN', 'http://localhost:3000'),

  // S3
  S3_ENDPOINT: optionalEnv('S3_ENDPOINT', 'http://localhost:9000'),
  S3_ACCESS_KEY: optionalEnv('S3_ACCESS_KEY', 'minioadmin'),
  S3_SECRET_KEY: optionalEnv('S3_SECRET_KEY', 'minioadmin'),
  S3_BUCKET: optionalEnv('S3_BUCKET', 'travel-planner'),
  S3_REGION: optionalEnv('S3_REGION', 'us-east-1'),
};
