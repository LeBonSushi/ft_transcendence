import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';

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

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('register', () => {
		it('should register a new user', async () => {
			const registerDto = { email: 'test@example.com', username: 'testuser', password: 'password123' };
			const result = { user: { email: 'test@example.com', username: 'testuser' }, message: "User created" };
			jest.spyOn(authService, 'register').mockImplementation(async () => result);

			expect(await authController.register(registerDto)).toEqual({ data: result });
		});
	});

	describe('login', () => {
		it('should login a user', async () => {
			const loginDto = { email: 'test@example.com', password: 'password123' };
			const result = { data: { id: 1, email: 'test@example.com', username: 'testuser' }, message: "Login successful" };
			jest.spyOn(authService, 'login').mockImplementation(async () => result);
			
			expect(await authController.login(loginDto)).toEqual({ data: result });
		});
	});
});