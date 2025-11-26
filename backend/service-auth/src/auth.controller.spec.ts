import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
	let authController: AuthController;

	beforeEach(async () => {
			const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthService],
		}).compile();

		authController = module.get<AuthController>(AuthController);
	});
	
	describe('login', () => {
		it('should return login response', () => {
			const body = { email: 'test@test.com', password: '1234' };
			const result = authController.login(body);
			expect(result).toEqual({ message: 'Login OK', data: body });
		});
	});

	describe('register', () => {
		it('should return register response', () => {
			const body = { email: 'test@test.com', password: '1234' };
			const result = authController.register(body);
			expect(result).toEqual({ message: 'Register OK', data: body });
		});
	});
});