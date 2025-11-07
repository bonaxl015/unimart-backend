import { z } from 'zod';

export const productSchema = z.object({
	id: z.uuid(),
	title: z.string(),
	description: z.string(),
	price: z.string(),
	stock: z.number(),
	popularity: z.number(),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});
