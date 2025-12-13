import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log('Cleaning database...');

	// Delete all data (respects foreign keys - order matters)
	await prisma.activitySuggestion.deleteMany();
	await prisma.tripVote.deleteMany();
	await prisma.tripProposal.deleteMany();
	await prisma.userAvailability.deleteMany();
	await prisma.message.deleteMany();
	await prisma.roomMember.deleteMany();
	await prisma.room.deleteMany();
	await prisma.friendship.deleteMany();
	await prisma.profile.deleteMany();
	await prisma.user.deleteMany();

	console.log('Database cleaned (UUIDs, no sequences to reset)');
}

main()
	.catch((e) => {
		console.error('Reset failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
