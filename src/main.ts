import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api/v1');

	app.useGlobalFilters(new GlobalExceptionFilter());

	await app.listen(process.env.PORT ?? 5055);
}

void bootstrap();
