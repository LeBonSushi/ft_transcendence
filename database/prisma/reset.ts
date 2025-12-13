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

	// Delete all data (respects foreign keys)
	await prisma.gameStats.deleteMany();
	await prisma.game.deleteMany();
	await prisma.message.deleteMany();
	await prisma.room.deleteMany();
	await prisma.profile.deleteMany();
	await prisma.user.deleteMany();

	// Reset sequences to 1
	await prisma.$executeRawUnsafe(`
		ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
		ALTER SEQUENCE "Profile_id_seq" RESTART WITH 1;
		ALTER SEQUENCE "Message_id_seq" RESTART WITH 1;
		ALTER SEQUENCE "Room_id_seq" RESTART WITH 1;
		ALTER SEQUENCE "Game_id_seq" RESTART WITH 1;
		ALTER SEQUENCE "GameStats_id_seq" RESTART WITH 1;
	`);

	console.log('Database cleaned and sequences reset');
}

main()
	.catch((e) => {
		console.error('Reset failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
