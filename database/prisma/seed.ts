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

	// Hash password
	const hashedPassword = await bcrypt.hash('password123', 10);

	// Create test users
	const user1 = await prisma.user.upsert({
		where: { email: 'test@test.com' },
		update: {},
		create: {
			email: 'test1@test.com',
			username: 'test',
			passwordHash: hashedPassword,
			profile: {
				create: {
					firstName: 'Test',
					lastName: 'User One',
                    profilePicture: 'https://imgs.search.brave.com/iMJK3oxPEkWMqmamus1UjVdA6ZVAyc5-IeTNLDALNiM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9xdWVl/cmFuZHByaWRlLmJl/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI0/LzA3L2JpLnBuZw',
					bio: 'First test user',
				},
			},
		},
	});

	const user2 = await prisma.user.upsert({
		where: { email: 'cou@cou.com' },
		update: {},
		create: {
			email: 'cou@cou.com',
			username: 'cou',
			passwordHash: hashedPassword,
			profile: {
				create: {
					firstName: 'cou',
					lastName: 'cou Two',
                    profilePicture: 'https://imgs.search.brave.com/Is6Aohxx_VLDZuaE6uf06dqa3xV3EAd_FLSkm2-bLzs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvNTAwcC82/Mi8zNC91c2VyLXBy/b2ZpbGUtaWNvbi1h/bm9ueW1vdXMtcGVy/c29uLXN5bWJvbC1i/bGFuay12ZWN0b3It/NTMyMTYyMzQuanBn',
					bio: 'Second test user',
				},
			},
		},
	});

	console.log('Created users:', { user1, user2 });
}

main()
	.catch((e) => {
		console.error('Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
