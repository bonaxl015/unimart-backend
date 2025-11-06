import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true
	});

	app.setGlobalPrefix('api/v1');

	app.useLogger(app.get(Logger));

	app.useGlobalFilters(new GlobalExceptionFilter());

	await app.listen(process.env.PORT ?? 5055);
}

void bootstrap();
