import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const addProductImageSchema = z.object({
	productId: z.uuid(),
	url: z.url().max(255)
});

export class AddProductImageDto extends createZodDto(addProductImageSchema) {}
