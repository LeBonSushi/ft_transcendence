import { NestFactory } from '@nestjs/core';
import { GameModule } from './game.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(GameModule);
	app.useGlobalFilters(new HttpExceptionFilter());
	await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
