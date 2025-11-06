import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (!requiredRoles) return true;

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const user = request.user;

		if (!user) {
			throw new ForbiddenException('No user found in request');
		}

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException('You do not have permission to perform this action');
		}

		return true;
	}
}
