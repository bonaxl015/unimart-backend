import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const globalErrorSchema = z.object({
	success: z.boolean().default(false),
	message: z.string().default('Validation error'),
	error: z.array(z.string().default('key: Invalid key value')),
	timestamp: z.string().default('2025-11-07T06:16:42.897Z')
});

export class GlobalErrorDto extends createZodDto(globalErrorSchema) {}
