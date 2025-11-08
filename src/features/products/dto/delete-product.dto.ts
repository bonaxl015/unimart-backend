import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteProductParamSchema = z.object({
	id: z.uuid()
});

export class DeleteProductParamDto extends createZodDto(deleteProductParamSchema) {}
