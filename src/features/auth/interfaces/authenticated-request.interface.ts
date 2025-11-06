import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
	userId: string;
	email: string;
	role: Role;
}

export interface AuthenticatedRequest extends Request {
	user: AuthenticatedUser;
}
