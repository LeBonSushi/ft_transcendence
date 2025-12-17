import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

let luciaInstance: Lucia | null = null;

export function getLucia(): Lucia {
  if (!luciaInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });

    const adapter_pg = new PrismaPg(pool);

    const prisma = new PrismaClient({
      adapter: adapter_pg,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    const adapter = new PrismaAdapter((prisma as any).session, (prisma as any).user);

    luciaInstance = new Lucia(adapter, {
      sessionCookie: {
        attributes: {
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        },
      },
      getUserAttributes: (attributes) => {
        return {
          username: attributes.username,
          email: attributes.email,
        };
      },
    });
  }

  return luciaInstance;
}

// Export for convenience
export const lucia = getLucia();

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  email: string;
}
