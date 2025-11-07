import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';
import { paginationResponseSchema } from '../../../common/dto/pagination.dto';

const productListSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid(),
	images: z.array(z.any())
});

export const getAllProductResponseSchema = paginationResponseSchema(productListSchema);

export class GetAllProductResponseDto extends createZodDto(getAllProductResponseSchema) {}
