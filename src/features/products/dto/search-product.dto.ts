import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { productSchema } from './product.dto';
import { paginationResponseSchema } from '../../../common/dto/pagination.dto';
import { productImageSchema } from './product-image.dto';

const productSearchSchema = productSchema.extend({
	ownerId: z.uuid(),
	categoryId: z.uuid(),
	images: z.array(productImageSchema)
});

export const productSearchResponseSchema = paginationResponseSchema(productSearchSchema);

export class ProductSearchResponseDto extends createZodDto(productSearchResponseSchema) {}
