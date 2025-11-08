import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteReviewParamSchema = z.object({
	id: z.uuid()
});

export class DeleteReviewParamSchema extends createZodDto(deleteReviewParamSchema) {}
