import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteResponseSchema = z.object({
	deleted: z.boolean().default(true),
	message: z.string().default('Deleted successfully')
});

export class DeleteResponseDto extends createZodDto(deleteResponseSchema) {}
