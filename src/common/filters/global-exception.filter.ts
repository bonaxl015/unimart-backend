import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';
		let errors: string[] | undefined;

		// Handle HttpException (NestJS built-in)
		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const responseBody = exception.getResponse();

			if (typeof responseBody === 'string') {
				message = responseBody;
			}

			if (typeof responseBody === 'object') {
				const { message: msg } = responseBody as Record<string, unknown>;

				message = Array.isArray(msg) ? msg.join(', ') : ((msg as string) ?? message);
			}
		}

		// Handle Zod validation errors
		else if (exception instanceof ZodError) {
			status = HttpStatus.BAD_REQUEST;
			message = 'Validation error';
			errors = exception.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
		}

		// Handle Prisma database errors
		else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			status = HttpStatus.BAD_REQUEST;
			message = this.mapPrismaError(exception);
		}

		response.status(status).json({
			success: false,
			message,
			error: errors ?? [],
			timestamp: new Date().toISOString()
		});
	}

	private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): string {
		switch (exception.code) {
			case 'P2002':
				return 'Unique constraint failed: a record with this value already exists';
			case 'P2025':
				return 'Record not found';
			default:
				return `Database error: ${exception.code}`;
		}
	}
}
