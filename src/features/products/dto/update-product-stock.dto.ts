import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateProductStockSchema = z.object({
	stock: z.number().int().min(0)
});

export class UpdateProductStockDto extends createZodDto(updateProductStockSchema) {}
