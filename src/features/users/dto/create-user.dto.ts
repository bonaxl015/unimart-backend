import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { userSchema } from './user.dto';

export const createUserBodySchema = z.object({
	email: z.email(),
	name: z.string().min(2).max(50),
	password: z.string().min(8).max(100)
});

export const createUserResponseSchema = userSchema;

export class CreateUserBodyDto extends createZodDto(createUserBodySchema) {}

export class CreateUserResponseDto extends createZodDto(createUserResponseSchema) {}
