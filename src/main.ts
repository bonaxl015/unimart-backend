import helmet from 'helmet';
import hpp from 'hpp';
import rateLimiter from 'express-rate-limit';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { MS_TO_MINUTES } from './constants/time-conversion';
import { AuditLoggerInterceptor } from './common/interceptors/audit-logger.interceptor';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true
	});

	// Secure HTTP headers
	app.use(helmet());

	// Prevent HTTP parameter pollution
	app.use(hpp());

	// Rate limiter
	app.use(
		rateLimiter({
			windowMs: 15 * MS_TO_MINUTES,
			max: 100,
			message: 'Too many requests. Please try again later'
		})
	);

	app.setGlobalPrefix('api/v1');

	app.useLogger(app.get(Logger));

	app.useGlobalInterceptors(app.get(AuditLoggerInterceptor), app.get(SanitizeInterceptor));

	app.useGlobalFilters(new GlobalExceptionFilter());

	await app.listen(process.env.PORT ?? 5055);
}

void bootstrap();
