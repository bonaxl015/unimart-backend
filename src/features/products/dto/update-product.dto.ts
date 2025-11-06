import { z } from 'zod';

export const updateProductSchema = z.object({
	title: z.string().min(3).max(50).optional(),
	description: z.string().min(10).max(255).optional(),
	price: z.number().positive().max(99999).optional()
});
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
