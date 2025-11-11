import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteProductImageParamSchema = z.object({
	id: z.uuid()
});

export const deleteProductImageBodySchema = z.object({
	productId: z.uuid()
});

export class DeleteProductImageParamDto extends createZodDto(deleteProductImageParamSchema) {}

export class DeleteProductImageBodyDto extends createZodDto(deleteProductImageBodySchema) {}
