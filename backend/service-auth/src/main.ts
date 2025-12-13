import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AuthModule);

	app.useGlobalFilters(new HttpExceptionFilter());
	await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
