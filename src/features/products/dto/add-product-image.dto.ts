import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productImageSchema } from './product-image.dto';

export const addProductImageBodySchema = z.object({
	productId: z.uuid(),
	url: z.url().max(255)
});

export const addProductImageResponseSchema = productImageSchema;

export class AddProductImageBodyDto extends createZodDto(addProductImageBodySchema) {}

export class AddProductImageResponseDto extends createZodDto(addProductImageResponseSchema) {}
