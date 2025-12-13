import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from './prisma.service';

describe('ChatController', () => {
	let chatController: ChatController;
	let chatService: ChatService;

	// Mock PrismaService simple
	const mockPrismaService = {
		user: {
			findUnique: jest.fn(),
			create: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChatController],
			providers: [
				ChatService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		chatController = module.get<ChatController>(ChatController);
		chatService = module.get<ChatService>(ChatService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(chatController).toBeDefined();
	});
});
