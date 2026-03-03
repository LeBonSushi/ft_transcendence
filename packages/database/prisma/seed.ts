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
    where: { email: 'akaza@example.com' },
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

  const user6 = await prisma.user.upsert({
    where: { email: 'bdhdu28@example.com' },
    update: {},
    create: {
      email: 'bdhdu38@example.com',
      username: 'coucou',
      profile: {
        create: {
          firstName: 'azaka',
          lastName: 'test',
        },
      },
    },
  });

  console.log('✅ Created 6 users with minimal profiles');

  // Create friendship between Alice and Bob (ACCEPTED)
  await prisma.friendship.createMany({
    data: [
      { userId: user1.id, friendId: user2.id, status: 'ACCEPTED' },
      { userId: user1.id, friendId: user3.id, status: 'ACCEPTED' },
      { userId: user2.id, friendId: user3.id, status: 'ACCEPTED' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created friendships');

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      name: 'Summer Trip Planning',
      type: 'GROUP',
      creatorId: user1.id,
      description: 'Planning our summer vacation to Spain',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'Weekend Hiking Adventure',
      type: 'GROUP',
      creatorId: user2.id,
      description: 'Let\'s organize a hiking trip to the Alps',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  console.log('✅ Created 2 rooms');

  // Add members to rooms
  await prisma.roomMember.createMany({
    data: [
      // Room 1 members
      { roomId: room1.id, userId: user1.id, role: 'ADMIN' },
      { roomId: room1.id, userId: user2.id, role: 'MEMBER' },
      { roomId: room1.id, userId: user3.id, role: 'MEMBER' },
      { roomId: room1.id, userId: user4.id, role: 'MEMBER' },
      // Room 2 members
      { roomId: room2.id, userId: user2.id, role: 'ADMIN' },
      { roomId: room2.id, userId: user1.id, role: 'MEMBER' },
      { roomId: room2.id, userId: user5.id, role: 'MEMBER' },
      { roomId: room2.id, userId: user6.id, role: 'MEMBER' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Added room members');

  // Add messages
  await prisma.message.createMany({
    data: [
      // Room 1 messages
      {
        roomId: room1.id,
        senderId: user1.id,
        content: 'Hey everyone! I found a great deal for flights to Barcelona in July!',
        type: 'TEXT',
      },
      {
        roomId: room1.id,
        senderId: user2.id,
        content: 'That sounds amazing! What dates are we thinking?',
        type: 'TEXT',
      },
      {
        roomId: room1.id,
        senderId: user3.id,
        content: 'I\'m available from July 15-25. Let me know!',
        type: 'TEXT',
      },
      {
        roomId: room1.id,
        senderId: user4.id,
        content: 'I might be able to join too. Need to check with my boss.',
        type: 'TEXT',
      },
      // Room 2 messages
      {
        roomId: room2.id,
        senderId: user2.id,
        content: 'Who wants to join me for a hiking trip next month?',
        type: 'TEXT',
      },
      {
        roomId: room2.id,
        senderId: user1.id,
        content: 'I\'m in! Which mountain range?',
        type: 'TEXT',
      },
      {
        roomId: room2.id,
        senderId: user5.id,
        content: 'The Alps sound perfect! I love hiking there.',
        type: 'TEXT',
      },
    ],
  });

  console.log('✅ Created messages');

  // Add user availabilities
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  
  await prisma.userAvailability.createMany({
    data: [
      // Room 1 availabilities
      {
        roomId: room1.id,
        userId: user1.id,
        startDate: new Date(2026, 6, 10), // July 10
        endDate: new Date(2026, 6, 25),   // July 25
        notes: 'Available the whole month',
      },
      {
        roomId: room1.id,
        userId: user2.id,
        startDate: new Date(2026, 6, 15), // July 15
        endDate: new Date(2026, 6, 30),   // July 30
        notes: 'Flexible dates',
      },
      {
        roomId: room1.id,
        userId: user3.id,
        startDate: new Date(2026, 6, 15),
        endDate: new Date(2026, 6, 25),
        notes: 'Can\'t do after July 25',
      },
      {
        roomId: room1.id,
        userId: user4.id,
        startDate: new Date(2026, 6, 20),
        endDate: new Date(2026, 7, 5), // August 5
        notes: 'Only from mid-July',
      },
      // Room 2 availabilities
      {
        roomId: room2.id,
        userId: user2.id,
        startDate: new Date(2026, 3, 15), // April 15
        endDate: new Date(2026, 3, 30),   // April 30
        notes: 'Perfect for spring hiking',
      },
      {
        roomId: room2.id,
        userId: user1.id,
        startDate: new Date(2026, 3, 10),
        endDate: new Date(2026, 4, 10), // May 10
        notes: 'Available entire month of April',
      },
      {
        roomId: room2.id,
        userId: user5.id,
        startDate: new Date(2026, 3, 12),
        endDate: new Date(2026, 3, 28),
        notes: 'Mid-April works best',
      },
      {
        roomId: room2.id,
        userId: user6.id,
        startDate: new Date(2026, 4, 1), // May 1
        endDate: new Date(2026, 4, 15),  // May 15
        notes: 'Only available in May',
      },
    ],
  });

  console.log('✅ Created user availabilities');
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
