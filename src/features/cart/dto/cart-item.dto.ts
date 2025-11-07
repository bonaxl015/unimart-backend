import { z } from 'zod';

export const cartItemSchema = z.object({
	id: z.uuid(),
	userId: z.uuid(),
	productId: z.uuid(),
	quantity: z.number(),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});
