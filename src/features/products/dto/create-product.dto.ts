import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';

export const createProductSchema = z.object({
	title: z.string().min(3).max(50),
	description: z.string().min(10).max(255),
	price: z.number().positive().max(99999)
});

export const createProductResponseSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid()
});

export class CreateProductDto extends createZodDto(createProductSchema) {}

export class CreateProductResponseDto extends createZodDto(createProductResponseSchema) {}
