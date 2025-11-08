import z from 'zod';

export const productImageSchema = z.object({
	id: z.uuid(),
	productId: z.uuid(),
	url: z.string().default('http://sample-image.com/product-image'),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});
