import { z } from 'zod';

export const createProductSchema = z.object({
	title: z.string().min(3).max(50),
	description: z.string().min(10).max(255),
	price: z.number().positive().max(99999)
});
export type CreateProductDto = z.infer<typeof createProductSchema>;
