import { z } from 'zod';

export const productSchema = z.object({
	id: z.uuid(),
	title: z.string().default('Test Product'),
	description: z.string().default('An amazing product that is useful for your daily living'),
	price: z.string().default('100.50'),
	stock: z.number().default(200),
	popularity: z.number().default(5),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});
