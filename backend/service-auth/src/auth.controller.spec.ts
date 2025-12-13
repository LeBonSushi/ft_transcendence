// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { PrismaService } from './services/prisma.service';

// describe('AuthController', () => {
// 	let authController: AuthController;
// 	let authService: AuthService;

// 	// Mock PrismaService simple
// 	const mockPrismaService = {
// 		user: {
// 			findUnique: jest.fn(),
// 			create: jest.fn(),
// 		},
// 	};

// 	beforeEach(async () => {
// 		const module: TestingModule = await Test.createTestingModule({
// 			controllers: [AuthController],
// 			providers: [
// 				AuthService,
// 				{
// 					provide: PrismaService,
// 					useValue: mockPrismaService,
// 				},
// 			],
// 		}).compile();

// 		authController = module.get<AuthController>(AuthController);
// 		authService = module.get<AuthService>(AuthService);
// 	});

// 	afterEach(() => {
// 		jest.clearAllMocks();
// 	});

// 	it('should be defined', () => {
// 		expect(authController).toBeDefined();
// 	});
// });