import { z } from 'zod';

export const addProductImageSchema = z.object({
	productId: z.uuid(),
	url: z.url().max(255)
});

export type AddProductImageDto = z.infer<typeof addProductImageSchema>;
