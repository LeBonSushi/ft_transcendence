import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Load environment variables from the root .env file
config({ path: resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  // Ensure password is treated as a string
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seed...');

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Martin',
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'alicia',
      profile: {
        create: {
          firstName: 'Bob',
          lastName: 'Dupont',
        },
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      profile: {
        create: {
          firstName: 'Charlie',
          lastName: 'Leblanc',
        },
      },
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: {
      email: 'david@example.com',
      username: 'david',
      profile: {
        create: {
          firstName: 'David',
          lastName: 'Bernard',
        },
      },
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: {
      email: 'akaza@example.com',
      username: 'akaza',
      profile: {
        create: {
          firstName: 'Gavin',
          lastName: 'Satoru',
        },
      },
    },
  });

  console.log('✅ Created 4 users with minimal profiles');

  // Create friendship between Alice and Bob (ACCEPTED)
  await prisma.friendship.createMany({
    data: [
      { userId: user1.id, friendId: user2.id, status: 'ACCEPTED' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created friendship between Alice and Bob');
  console.log('   Charlie and David have no friend requests');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
