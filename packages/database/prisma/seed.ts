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
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Starting database seed...');

  const testPassword = 'qwertyuiop';
  const passwordHash = await bcrypt.hash(testPassword, 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {
      passwordHash,
    },
    create: {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash,
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
    update: {
      passwordHash,
    },
    create: {
      email: 'bob@example.com',
      username: 'alicia',
      passwordHash,
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
    update: {
      passwordHash,
    },
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      passwordHash,
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
    update: {
      passwordHash,
    },
    create: {
      email: 'david@example.com',
      username: 'david',
      passwordHash,
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
    update: {
      passwordHash,
    },
    create: {
      email: 'akaza@example.com',
      username: 'akaza',
      passwordHash,
      profile: {
        create: {
          firstName: 'Gavin',
          lastName: 'Satoru',
        },
      },
    },
  });

  const user6 = await prisma.user.upsert({
    where: { email: 'bdhdu38@example.com' },
    update: {
      passwordHash,
    },
    create: {
      email: 'bdhdu38@example.com',
      username: 'coucou',
      passwordHash,
      profile: {
        create: {
          firstName: 'azaka',
          lastName: 'test',
        },
      },
    },
  });


  // Create friendship between Alice and Bob (ACCEPTED)
  await prisma.friendship.createMany({
    data: [
      { userId: user1.id, friendId: user2.id, status: 'ACCEPTED' },
      { userId: user1.id, friendId: user3.id, status: 'ACCEPTED' },
      { userId: user2.id, friendId: user3.id, status: 'ACCEPTED' },
    ],
    skipDuplicates: true,
  });


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

  const room3 = await prisma.room.create({
    data: {
      name: 'Case A - Impossible No Overlap',
      type: 'GROUP',
      creatorId: user1.id,
      description: 'Edge case: every user has availability but no common overlap',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: 'Case B - Boundary Touching',
      type: 'GROUP',
      creatorId: user2.id,
      description: 'Edge case: ranges touch at boundaries only ([start, end) behavior)',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: 'Case C - Fallback 70',
      type: 'GROUP',
      creatorId: user3.id,
      description: 'Tricky case: 4/5 users overlap, one far outlier',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room6 = await prisma.room.create({
    data: {
      name: 'Case D - Fallback 50 Split Groups',
      type: 'GROUP',
      creatorId: user4.id,
      description: 'Two user clusters with no global overlap',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room7 = await prisma.room.create({
    data: {
      name: 'Case E - Multi Windows Per User',
      type: 'GROUP',
      creatorId: user1.id,
      description: 'Users have multiple windows, tests sweep-line event counting',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room8 = await prisma.room.create({
    data: {
      name: 'Case F - Invalid User Availability',
      type: 'GROUP',
      creatorId: user2.id,
      description: 'Contains invalid range startDate >= endDate to test validation path',
      status: 'PLANNING',
      isPrivate: false,
    },
  });

  const room9 = await prisma.room.create({
    data: {
      name: 'Case G - Not Enough Users Available',
      type: 'GROUP',
      creatorId: user3.id,
      description: 'Room has many members but only one user added availability',
      status: 'PLANNING',
      isPrivate: false,
    },
  });


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
      // Room 3 members (impossible overlap)
      { roomId: room3.id, userId: user1.id, role: 'ADMIN' },
      { roomId: room3.id, userId: user2.id, role: 'MEMBER' },
      { roomId: room3.id, userId: user3.id, role: 'MEMBER' },
      { roomId: room3.id, userId: user4.id, role: 'MEMBER' },
      // Room 4 members (boundary touching)
      { roomId: room4.id, userId: user2.id, role: 'ADMIN' },
      { roomId: room4.id, userId: user1.id, role: 'MEMBER' },
      { roomId: room4.id, userId: user3.id, role: 'MEMBER' },
      // Room 5 members (fallback 70)
      { roomId: room5.id, userId: user3.id, role: 'ADMIN' },
      { roomId: room5.id, userId: user1.id, role: 'MEMBER' },
      { roomId: room5.id, userId: user2.id, role: 'MEMBER' },
      { roomId: room5.id, userId: user4.id, role: 'MEMBER' },
      { roomId: room5.id, userId: user5.id, role: 'MEMBER' },
      // Room 6 members (fallback 50 split)
      { roomId: room6.id, userId: user4.id, role: 'ADMIN' },
      { roomId: room6.id, userId: user1.id, role: 'MEMBER' },
      { roomId: room6.id, userId: user2.id, role: 'MEMBER' },
      { roomId: room6.id, userId: user3.id, role: 'MEMBER' },
      { roomId: room6.id, userId: user5.id, role: 'MEMBER' },
      // Room 7 members (multiple windows)
      { roomId: room7.id, userId: user1.id, role: 'ADMIN' },
      { roomId: room7.id, userId: user2.id, role: 'MEMBER' },
      { roomId: room7.id, userId: user3.id, role: 'MEMBER' },
      { roomId: room7.id, userId: user6.id, role: 'MEMBER' },
      // Room 8 members (invalid range)
      { roomId: room8.id, userId: user2.id, role: 'ADMIN' },
      { roomId: room8.id, userId: user4.id, role: 'MEMBER' },
      { roomId: room8.id, userId: user5.id, role: 'MEMBER' },
      // Room 9 members (not enough users with availability)
      { roomId: room9.id, userId: user3.id, role: 'ADMIN' },
      { roomId: room9.id, userId: user1.id, role: 'MEMBER' },
      { roomId: room9.id, userId: user2.id, role: 'MEMBER' },
      { roomId: room9.id, userId: user6.id, role: 'MEMBER' },
    ],
    skipDuplicates: true,
  });


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


  // Add user availabilities (normal + edge-case scenarios for matching)
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

      // Room 3 - Impossible overlap (no two users overlap)
      {
        roomId: room3.id,
        userId: user1.id,
        startDate: new Date(2026, 0, 1),
        endDate: new Date(2026, 0, 3),
        notes: 'Slot A',
      },
      {
        roomId: room3.id,
        userId: user2.id,
        startDate: new Date(2026, 0, 4),
        endDate: new Date(2026, 0, 6),
        notes: 'Slot B',
      },
      {
        roomId: room3.id,
        userId: user3.id,
        startDate: new Date(2026, 0, 7),
        endDate: new Date(2026, 0, 9),
        notes: 'Slot C',
      },
      {
        roomId: room3.id,
        userId: user4.id,
        startDate: new Date(2026, 0, 10),
        endDate: new Date(2026, 0, 12),
        notes: 'Slot D',
      },

      // Room 4 - Boundary touching only: [start, end) should not overlap at exact boundary
      {
        roomId: room4.id,
        userId: user1.id,
        startDate: new Date(2026, 1, 1),
        endDate: new Date(2026, 1, 5),
        notes: 'Ends exactly when Bob starts',
      },
      {
        roomId: room4.id,
        userId: user2.id,
        startDate: new Date(2026, 1, 5),
        endDate: new Date(2026, 1, 10),
        notes: 'Starts at Alice end boundary',
      },
      {
        roomId: room4.id,
        userId: user3.id,
        startDate: new Date(2026, 1, 10),
        endDate: new Date(2026, 1, 14),
        notes: 'Starts at Bob end boundary',
      },

      // Room 5 - Fallback 70% expected: 4 users overlap, 1 user is far away
      {
        roomId: room5.id,
        userId: user1.id,
        startDate: new Date(2026, 5, 8),
        endDate: new Date(2026, 5, 20),
        notes: 'Core overlap group',
      },
      {
        roomId: room5.id,
        userId: user2.id,
        startDate: new Date(2026, 5, 10),
        endDate: new Date(2026, 5, 19),
        notes: 'Core overlap group',
      },
      {
        roomId: room5.id,
        userId: user3.id,
        startDate: new Date(2026, 5, 9),
        endDate: new Date(2026, 5, 15),
        notes: 'Core overlap group',
      },
      {
        roomId: room5.id,
        userId: user4.id,
        startDate: new Date(2026, 5, 11),
        endDate: new Date(2026, 5, 16),
        notes: 'Core overlap group',
      },
      {
        roomId: room5.id,
        userId: user5.id,
        startDate: new Date(2026, 7, 1),
        endDate: new Date(2026, 7, 12),
        notes: 'Outlier user (forces fallback)',
      },

      // Room 6 - Split groups, tests weaker fallback levels
      {
        roomId: room6.id,
        userId: user1.id,
        startDate: new Date(2026, 8, 1),
        endDate: new Date(2026, 8, 8),
        notes: 'Group A',
      },
      {
        roomId: room6.id,
        userId: user2.id,
        startDate: new Date(2026, 8, 2),
        endDate: new Date(2026, 8, 7),
        notes: 'Group A',
      },
      {
        roomId: room6.id,
        userId: user3.id,
        startDate: new Date(2026, 8, 15),
        endDate: new Date(2026, 8, 22),
        notes: 'Group B',
      },
      {
        roomId: room6.id,
        userId: user4.id,
        startDate: new Date(2026, 8, 14),
        endDate: new Date(2026, 8, 21),
        notes: 'Group B',
      },
      {
        roomId: room6.id,
        userId: user5.id,
        startDate: new Date(2026, 8, 30),
        endDate: new Date(2026, 9, 2),
        notes: 'Isolated user',
      },

      // Room 7 - Multiple windows per user, with overlapping ranges and duplicates risk
      {
        roomId: room7.id,
        userId: user1.id,
        startDate: new Date(2026, 10, 1),
        endDate: new Date(2026, 10, 4),
        notes: 'Window 1',
      },
      {
        roomId: room7.id,
        userId: user1.id,
        startDate: new Date(2026, 10, 8),
        endDate: new Date(2026, 10, 12),
        notes: 'Window 2',
      },
      {
        roomId: room7.id,
        userId: user2.id,
        startDate: new Date(2026, 10, 2),
        endDate: new Date(2026, 10, 6),
        notes: 'Window 1',
      },
      {
        roomId: room7.id,
        userId: user2.id,
        startDate: new Date(2026, 10, 9),
        endDate: new Date(2026, 10, 11),
        notes: 'Window 2',
      },
      {
        roomId: room7.id,
        userId: user3.id,
        startDate: new Date(2026, 10, 3),
        endDate: new Date(2026, 10, 5),
        notes: 'Narrow overlap in early window',
      },
      {
        roomId: room7.id,
        userId: user3.id,
        startDate: new Date(2026, 10, 10),
        endDate: new Date(2026, 10, 14),
        notes: 'Broader overlap in late window',
      },
      {
        roomId: room7.id,
        userId: user6.id,
        startDate: new Date(2026, 10, 9),
        endDate: new Date(2026, 10, 13),
        notes: 'Late window participant',
      },

      // Room 8 - Invalid availability to trigger validation exception
      {
        roomId: room8.id,
        userId: user2.id,
        startDate: new Date(2026, 2, 18),
        endDate: new Date(2026, 2, 16),
        notes: 'Invalid: startDate after endDate',
      },
      {
        roomId: room8.id,
        userId: user4.id,
        startDate: new Date(2026, 2, 15),
        endDate: new Date(2026, 2, 20),
        notes: 'Valid range',
      },
      {
        roomId: room8.id,
        userId: user5.id,
        startDate: new Date(2026, 2, 17),
        endDate: new Date(2026, 2, 23),
        notes: 'Valid range',
      },

      // Room 9 - Only one user has availability (should fail min users check)
      {
        roomId: room9.id,
        userId: user1.id,
        startDate: new Date(2026, 11, 5),
        endDate: new Date(2026, 11, 12),
        notes: 'Only availability in this room',
      },
    ],
  });

}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
