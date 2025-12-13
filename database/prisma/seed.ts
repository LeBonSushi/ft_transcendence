import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log('Seeding database...');

	const hashedPassword = await bcrypt.hash('password123', 10);

	// Create 3 test users with profiles
	const user1 = await prisma.user.create({
		data: {
			email: 'alice@test.com',
			username: 'alice',
			passwordHash: hashedPassword,
			profile: {
				create: {
					firstName: 'Alice',
					lastName: 'Smith',
					profilePicture: 'https://i.pravatar.cc/150?img=1',
					bio: 'Travel enthusiast and coffee lover ☕',
					location: 'Paris, France',
				},
			},
		},
	});

	const user2 = await prisma.user.create({
		data: {
			email: 'bob@test.com',
			username: 'bob',
			passwordHash: hashedPassword,
			profile: {
				create: {
					firstName: 'Bob',
					lastName: 'Johnson',
					profilePicture: 'https://i.pravatar.cc/150?img=2',
					bio: 'Adventure seeker 🏔️',
					location: 'Lyon, France',
				},
			},
		},
	});

	const user3 = await prisma.user.create({
		data: {
			email: 'charlie@test.com',
			username: 'charlie',
			passwordHash: hashedPassword,
			profile: {
				create: {
					firstName: 'Charlie',
					lastName: 'Davis',
					profilePicture: 'https://i.pravatar.cc/150?img=3',
					bio: 'Love exploring new places 🌍',
					location: 'Marseille, France',
				},
			},
		},
	});

	console.log('✓ Created 3 users with profiles');

	// Create friendships
	const friendship1 = await prisma.friendship.create({
		data: {
			userId: user1.id,
			friendId: user2.id,
			status: 'ACCEPTED',
		},
	});

	const friendship2 = await prisma.friendship.create({
		data: {
			userId: user1.id,
			friendId: user3.id,
			status: 'ACCEPTED',
		},
	});

	const friendship3 = await prisma.friendship.create({
		data: {
			userId: user2.id,
			friendId: user3.id,
			status: 'PENDING',
		},
	});

	console.log('✓ Created 3 friendships (2 accepted, 1 pending)');

	// Create rooms with members
	const room1 = await prisma.room.create({
		data: {
			name: 'Weekend in Barcelona',
			description: 'Planning a fun weekend trip to Barcelona',
			creatorId: user1.id,
			status: 'PLANNING',
			members: {
				create: [
					{ userId: user1.id, role: 'ADMIN' },
					{ userId: user2.id, role: 'MEMBER' },
				],
			},
		},
	});

	const room2 = await prisma.room.create({
		data: {
			name: 'Summer Road Trip',
			description: 'Epic road trip through Southern France',
			creatorId: user2.id,
			status: 'PLANNING',
			members: {
				create: [
					{ userId: user2.id, role: 'ADMIN' },
					{ userId: user1.id, role: 'MEMBER' },
					{ userId: user3.id, role: 'MEMBER' },
				],
			},
		},
	});

	const room3 = await prisma.room.create({
		data: {
			name: 'Ski Trip 2026',
			description: 'Winter ski vacation in the Alps',
			creatorId: user3.id,
			status: 'CONFIRMED',
			members: {
				create: [
					{ userId: user3.id, role: 'ADMIN' },
					{ userId: user1.id, role: 'MEMBER' },
				],
			},
		},
	});

	console.log('✓ Created 3 rooms with memberships');

	// Add some messages
	await prisma.message.create({
		data: {
			roomId: room1.id,
			senderId: user1.id,
			content: 'Hey! So excited for Barcelona 🎉',
			type: 'TEXT',
		},
	});

	await prisma.message.create({
		data: {
			roomId: room1.id,
			senderId: user2.id,
			content: 'Me too! Should we look at flights?',
			type: 'TEXT',
		},
	});

	await prisma.message.create({
		data: {
			roomId: room2.id,
			senderId: user2.id,
			content: 'I found a great route through Provence',
			type: 'TEXT',
		},
	});

	console.log('✓ Added sample messages');

	console.log('\n=== Seed Summary ===');
	console.log('Users: alice@test.com, bob@test.com, charlie@test.com');
	console.log('Password for all: password123');
	console.log('Friendships: Alice↔Bob, Alice↔Charlie (accepted), Bob→Charlie (pending)');
	console.log('Rooms: 3 trip planning rooms with various members');
	console.log('====================\n');
}

main()
	.catch((e) => {
		console.error('Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
