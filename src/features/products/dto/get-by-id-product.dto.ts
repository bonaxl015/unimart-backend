import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';

export const getByIdProductParamSchema = z.object({
	id: z.uuid()
});

export const getByIdProductResponseSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid(),
	images: z.array(z.any()),
	reviews: z.array(z.any())
});

export class GetByIdProductParamDto extends createZodDto(getByIdProductParamSchema) {}

export class GetByIdProductResponseDto extends createZodDto(getByIdProductResponseSchema) {}
