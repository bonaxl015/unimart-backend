import { z } from 'zod';

export const reviewSchema = z.object({
	id: z.uuid(),
	productId: z.uuid(),
	userId: z.uuid(),
	rating: z.number(),
	comment: z.string(),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});
