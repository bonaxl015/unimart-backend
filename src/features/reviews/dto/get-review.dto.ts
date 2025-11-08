import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { reviewSchema } from './review.dto';

export const getReviewParamSchema = z.object({
	productId: z.uuid()
});

export const getReviewResponseSchema = reviewSchema.extend({
	user: z.any()
});

export class GetReviewParamSchema extends createZodDto(getReviewParamSchema) {}

export class GetReviewResponseSchema extends createZodDto(getReviewResponseSchema) {}
