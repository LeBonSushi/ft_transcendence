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

  // Create test users
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'jane+clerk_test@example.com' },
    update: {},
    create: {
      email: 'jane+clerk_test@example.com',
      username: 'jane',
      passwordHash: password,
      clerkId: 'user_38ClRPXR4Jhwvx1c5ZuomEKADRe',
      profile: {
        create: {
          firstName: 'Jane',
          lastName: 'Johnson',
          bio: 'Love traveling and exploring new places!',
          location: 'San Francisco, CA',
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash: password,
      profile: {
        create: {
          firstName: 'Bob',
          lastName: 'Smith',
          bio: 'Adventure seeker and food enthusiast',
          location: 'New York, NY',
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
      passwordHash: password,
      profile: {
        create: {
          firstName: 'Charlie',
          lastName: 'Brown',
          bio: 'Beach lover and photography enthusiast',
          location: 'Los Angeles, CA',
        },
      },
    },
  });

  console.log('✅ Created test users');

  // Create friendships
  await prisma.friendship.createMany({
    data: [
      { userId: user1.id, friendId: user2.id, status: 'ACCEPTED' },
      { userId: user1.id, friendId: user3.id, status: 'ACCEPTED' },
      { userId: user2.id, friendId: user3.id, status: 'PENDING' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created friendships');

  // Create a sample room
  const room = await prisma.room.create({
    data: {
      name: 'Tokyo Summer Trip 2025',
      description: 'Planning our amazing summer trip to Tokyo!',
      creatorId: user1.id,
      status: 'PLANNING',
      members: {
        create: [
          { userId: user1.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
      availabilities: {
        create: [
          {
            userId: user1.id,
            startDate: new Date('2025-07-01'),
            endDate: new Date('2025-07-15'),
            notes: 'Flexible on exact dates',
          },
          {
            userId: user2.id,
            startDate: new Date('2025-07-05'),
            endDate: new Date('2025-07-20'),
          },
        ],
      },
      tripProposals: {
        create: [
          {
            destination: 'Tokyo, Japan',
            startDate: new Date('2025-07-10'),
            endDate: new Date('2025-07-17'),
            budgetEstimate: 2500,
            description:
              'One week in Tokyo exploring culture, food, and nightlife. Includes visits to temples, shopping districts, and day trips to Mt. Fuji.',
            isSelected: false,
            votes: {
              create: [
                { userId: user1.id, vote: 'YES' },
                { userId: user2.id, vote: 'YES' },
                { userId: user3.id, vote: 'MAYBE' },
              ],
            },
            activities: {
              create: [
                {
                  title: 'Visit Senso-ji Temple',
                  description: 'Ancient Buddhist temple in Asakusa',
                  category: 'MUSEUM',
                  estimatedPrice: 0,
                  suggestedById: user1.id,
                },
                {
                  title: 'Sushi Dinner at Tsukiji',
                  description: 'Fresh sushi experience at the famous fish market',
                  category: 'RESTAURANT',
                  estimatedPrice: 80,
                  suggestedById: user2.id,
                },
                {
                  title: 'Shibuya Nightlife',
                  description: 'Explore bars and clubs in Shibuya district',
                  category: 'NIGHTLIFE',
                  estimatedPrice: 100,
                  suggestedById: user3.id,
                },
              ],
            },
          },
        ],
      },
      messages: {
        create: [
          {
            senderId: user1.id,
            content: 'Hey everyone! Excited to plan this trip together!',
            type: 'TEXT',
          },
          {
            senderId: user2.id,
            content: "Can't wait! I've always wanted to visit Japan.",
            type: 'TEXT',
          },
          {
            senderId: user3.id,
            content: 'I added some activity suggestions. What do you think?',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  console.log('✅ Created sample room with proposals and activities');

  // Create a second room - Paris trip
  const room2 = await prisma.room.create({
    data: {
      name: 'Paris Weekend Getaway',
      description: 'Quick weekend trip to Paris for shopping and sightseeing',
      creatorId: user2.id,
      status: 'PLANNING',
      members: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user2.id, role: 'ADMIN' },
        ],
      },
      messages: {
        create: [
          {
            senderId: user2.id,
            content: 'Let\'s plan a Paris trip! Who\'s in?',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'I\'d love to! How many days are we thinking?',
            type: 'TEXT',
          },
          {
            senderId: user2.id,
            content: 'Maybe 3-4 days in October?',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'Sounds perfect! Let\'s book some hotels',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  console.log('✅ Created Paris trip room');

  // Create a third room - hiking trip
  const room3 = await prisma.room.create({
    data: {
      name: 'Mountain Hiking Adventure',
      description: 'Epic hiking trip through the Rocky Mountains',
      creatorId: user3.id,
      status: 'PLANNING',
      members: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'ADMIN' },
        ],
      },
      messages: {
        create: [
          {
            senderId: user3.id,
            content: 'Guys, I found an amazing hiking trail!',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'That looks incredible! When can we go?',
            type: 'TEXT',
          },
          {
            senderId: user2.id,
            content: 'I\'m in! Need to get new hiking boots though',
            type: 'TEXT',
          },
          {
            senderId: user3.id,
            content: 'We should aim for August when weather is best',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'August works great for me! Let\'s do it',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  console.log('✅ Created hiking trip room with multiple messages');

  // Create direct messages (private conversations)
  const dm1 = await prisma.room.create({
    data: {
      name: `${user1.username}-${user2.username}`,
      type: 'DIRECT_MESSAGE',
      creatorId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user2.id, role: 'MEMBER' },
        ],
      },
      messages: {
        create: [
          {
            senderId: user1.id,
            content: 'Hey! How are you doing?',
            type: 'TEXT',
          },
          {
            senderId: user2.id,
            content: 'I\'m doing great! How about you?',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'Perfect! Want to grab coffee next week?',
            type: 'TEXT',
          },
          {
            senderId: user2.id,
            content: 'Absolutely! Tuesday at 3pm?',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  console.log('✅ Created DM between Jane and Bob');

  // Create another DM - Jane and Charlie
  const dm2 = await prisma.room.create({
    data: {
      name: `${user1.username}-${user3.username}`,
      type: 'DIRECT_MESSAGE',
      creatorId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
      messages: {
        create: [
          {
            senderId: user3.id,
            content: 'Did you see that new hiking spot I found?',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'Yeah! It looks amazing! When are you going?',
            type: 'TEXT',
          },
          {
            senderId: user3.id,
            content: 'Next weekend. Want to join?',
            type: 'TEXT',
          },
          {
            senderId: user1.id,
            content: 'I\'d love to! Count me in 🏔️',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  console.log('✅ Created DM between Jane and Charlie');

  // Create another DM - Bob and Charlie
  const dm3 = await prisma.room.create({
    data: {
      name: `${user2.username}-${user3.username}`,
      type: 'DIRECT_MESSAGE',
      creatorId: user2.id,
      members: {
        create: [
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
      messages: {
        create: [
          {
            senderId: user2.id,
            content: 'Hey Charlie, how\'s the hiking training going?',
            type: 'TEXT',
          },
          {
            senderId: user3.id,
            content: 'Great! I\'ve been hitting the trails twice a week',
            type: 'TEXT',
          },
          {
            senderId: user2.id,
            content: 'That\'s awesome! Maybe I should join you',
            type: 'TEXT',
          },
        ],
      },
    },
  });

  console.log('✅ Created DM between Bob and Charlie');

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
