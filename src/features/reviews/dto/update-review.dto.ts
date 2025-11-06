import { z } from 'zod';

export const updateReviewSchema = z.object({
	rating: z.number().int().min(1).max(5).optional(),
	comment: z.string().max(500).optional()
});

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
