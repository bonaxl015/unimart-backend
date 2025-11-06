import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest();

		if (req.body) {
			req.body = this.sanitizeObject(req.body);
		}

		return next.handle().pipe(map((data) => data));
	}

	private sanitizeObject(obj: any): any {
		if (typeof obj === 'string') {
			return DOMPurify.sanitize(obj);
		}

		if (typeof obj === 'object' && obj !== null) {
			for (const key in obj) {
				obj[key] = this.sanitizeObject(obj[key]);
			}
		}

		return obj;
	}
}
