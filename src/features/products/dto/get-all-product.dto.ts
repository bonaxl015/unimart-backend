import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';
import { paginationResponseSchema } from '../../../common/dto/pagination.dto';
import { productImageSchema } from './product-image.dto';

const productListSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid(),
	images: z.array(productImageSchema)
});

export const getAllProductResponseSchema = paginationResponseSchema(productListSchema);

export class GetAllProductResponseDto extends createZodDto(getAllProductResponseSchema) {}
