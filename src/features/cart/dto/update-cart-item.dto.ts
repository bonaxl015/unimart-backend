import { z } from 'zod';

export const updateCartItemSchema = z.object({
	quantity: z.number().int().positive().max(100)
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
