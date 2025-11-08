import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';

export const updateProductStockParamSchema = z.object({
	id: z.uuid()
});

export const updateProductStockBodySchema = z.object({
	stock: z.number().int().min(0)
});

export const updateProductStockResponseSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid()
});

export class UpdateProductStockParamDto extends createZodDto(updateProductStockParamSchema) {}

export class UpdateProductStockBodyDto extends createZodDto(updateProductStockBodySchema) {}

export class UpdateProductStockResponseDto extends createZodDto(updateProductStockResponseSchema) {}
