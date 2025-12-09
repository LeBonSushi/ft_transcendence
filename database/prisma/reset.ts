import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log('Cleaning database...');

	// Delete all data (respects foreign keys)
	await prisma.gameStats.deleteMany();
	await prisma.game.deleteMany();
	await prisma.message.deleteMany();
	await prisma.room.deleteMany();
	await prisma.profile.deleteMany();
	await prisma.user.deleteMany();

	console.log('Database cleaned');
}

main()
	.catch((e) => {
		console.error('Reset failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
