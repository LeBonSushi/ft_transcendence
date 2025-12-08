import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(UserModule);
	app.useGlobalFilters(new HttpExceptionFilter());
	await app.listen(process.env.PORT ?? 4004);
}
bootstrap();
