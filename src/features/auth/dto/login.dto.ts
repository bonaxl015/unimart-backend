import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(8)
});

export const loginResponseSchema = z.object({
	access_token: z.jwt()
});

export class LoginDto extends createZodDto(loginSchema) {}

export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
