import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';

describe('GameController', () => {
	let gameController: GameController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
		controllers: [GameController],
		providers: [GameService],
		}).compile();

		gameController = app.get<GameController>(GameController);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
		expect(gameController.getHello()).toBe('Hello World!');
		});
	});
});
