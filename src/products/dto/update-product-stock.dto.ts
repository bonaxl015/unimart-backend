import { z } from 'zod';

export const updateProductStockSchema = z.object({
	stock: z.number().int().min(0)
});

export type UpdateProductStockDto = z.infer<typeof updateProductStockSchema>;
