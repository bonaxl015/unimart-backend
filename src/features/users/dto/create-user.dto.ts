import { z } from 'zod';

export const createUserSchema = z.object({
	email: z.email(),
	name: z.string().min(2).max(50),
	password: z.string().min(8).max(100)
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
