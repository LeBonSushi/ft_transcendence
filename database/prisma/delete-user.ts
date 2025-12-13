import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	const userId = process.argv[2];

	if (!userId) {
		console.error('Usage: npm run delete-user <userId>');
		process.exit(1);
	}

	const user = await prisma.user.delete({
		where: { id: parseInt(userId) },
	});

	console.log('✅ User deleted:', user);
}

main()
	.catch((e) => {
		console.error('❌ Delete failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
