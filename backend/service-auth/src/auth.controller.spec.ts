import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './services/prisma.service';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: AuthService;

	// Mock PrismaService simple
	const mockPrismaService = {
		user: {
			findUnique: jest.fn(),
			create: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		authController = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	describe('login', () => {
		it('should return login response', () => {
			const body = { username: 'LeBonSushi', password: '1234' };
			const result = authController.login(body);
			expect(result).toEqual({ message: 'Login OK', data: body });
		});
	});

	describe('register', () => {
		it('should return register response', () => {
			const body = { email: 'test@test.com', username: "LeBonSushi", password: '1234' };
			const result = authController.register(body);
			expect(result).toEqual({ message: 'Register OK', data: body });
		});
	});
});
