import { z } from 'zod';
import { Role } from '@prisma/client';

export const userSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	email: z.email(),
	role: z.enum(Role),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});
