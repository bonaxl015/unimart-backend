import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { reviewSchema } from './review.dto';

export const createReviewBodySchema = z.object({
	productId: z.uuid(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().max(500)
});

export const createReviewResponseSchema = reviewSchema.extend({
	user: z.any()
});

export class CreateReviewBodyDto extends createZodDto(createReviewBodySchema) {}

export class CreateReviewResponseDto extends createZodDto(createReviewResponseSchema) {}
