import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(ChatModule);
	app.useGlobalFilters(new HttpExceptionFilter());
	await app.listen(process.env.PORT ?? 4002);
}
bootstrap();
