import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SortOrder } from '../enums/sort-order';

export const paginationQuerySchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(SortOrder).optional(),
	searchTerm: z.string().optional(),
	filters: z.record(z.any(), z.union([z.string(), z.number(), z.boolean()])).optional()
});

export const paginationResponseSchema = <T extends z.ZodTypeAny>(schemaObject: T) =>
	z.object({
		items: z.array(schemaObject),
		total: z.number().default(1),
		page: z.number().default(1),
		limit: z.number().default(10)
	});

export class PaginationQueryDto extends createZodDto(paginationQuerySchema) {}
