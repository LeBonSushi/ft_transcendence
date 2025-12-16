import { config } from 'dotenv';
import { join } from 'path';
import { defineConfig } from 'prisma/config';

// Load .env from project root
config({ path: join(process.cwd(), '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!
  }
});