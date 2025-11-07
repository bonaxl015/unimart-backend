import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteCartItemSchema = z.object({
	id: z.uuid()
});

export class DeleteCartItemDto extends createZodDto(deleteCartItemSchema) {}
