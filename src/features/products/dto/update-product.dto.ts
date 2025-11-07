import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';

export const updateProductParamSchema = z.object({
	id: z.uuid()
});

export const updateProductBodySchema = z.object({
	title: z.string().min(3).max(50).optional(),
	description: z.string().min(10).max(255).optional(),
	price: z.number().positive().max(99999).optional()
});

export const updateProductResponseSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid()
});

export class UpdateProductParamDto extends createZodDto(updateProductParamSchema) {}

export class UpdateProductBodyDto extends createZodDto(updateProductBodySchema) {}

export class UpdateProductResponseDto extends createZodDto(updateProductResponseSchema) {}
