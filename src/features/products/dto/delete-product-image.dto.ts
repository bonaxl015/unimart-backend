import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteProductImageParamSchema = z.object({
	id: z.uuid()
});

export class DeleteProductImageParamDto extends createZodDto(deleteProductImageParamSchema) {}
