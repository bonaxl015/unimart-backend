import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteReviewParamSchema = z.object({
	id: z.uuid()
});

export const deleteReviewBodySchema = z.object({
	productId: z.uuid()
});

export class DeleteReviewParamSchema extends createZodDto(deleteReviewParamSchema) {}

export class DeleteReviewBodySchema extends createZodDto(deleteReviewBodySchema) {}
