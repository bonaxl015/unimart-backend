import { z } from 'zod';

export const addCartItemSchema = z.object({
	productId: z.uuid(),
	quantity: z.number().int().positive().max(100)
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;
