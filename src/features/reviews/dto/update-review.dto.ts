import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { reviewSchema } from './review.dto';

export const updateReviewParamSchema = z.object({
	id: z.uuid()
});

export const updateReviewBodySchema = z.object({
	productId: z.uuid(),
	rating: z.number().int().min(1).max(5).optional(),
	comment: z.string().max(500).optional()
});

export const updateReviewResponseSchema = reviewSchema;

export class UpdateReviewParamDto extends createZodDto(updateReviewParamSchema) {}

export class UpdateReviewBodyDto extends createZodDto(updateReviewBodySchema) {}

export class UpdateReviewResponseDto extends createZodDto(updateReviewResponseSchema) {}
