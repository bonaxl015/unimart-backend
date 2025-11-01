import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
	AuthenticatedRequest,
	AuthenticatedUser
} from '../interfaces/authenticated-request.interface';

export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthenticatedUser => {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

		return request.user;
	}
);
