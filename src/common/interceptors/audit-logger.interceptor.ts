import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../features/auth/interfaces/authenticated-request.interface';

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
	constructor(private readonly logger: Logger) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const { method, originalUrl, body, query, params } = req;
		const user = req.user;

		const userInfo = user ? `${user.email} (Role: ${user.role})` : 'Unauthenticated';

		this.logger.log({
			msg: 'Incoming Request',
			method,
			url: originalUrl,
			user: userInfo,
			params,
			query,
			body
		});

		return next.handle().pipe(
			tap((data) => {
				this.logger.log({
					msg: `Response for ${method} ${originalUrl}`,
					user: userInfo,
					response: data
				});
			})
		);
	}
}
