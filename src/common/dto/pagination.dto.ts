import { z } from 'zod';
import { SortOrder } from '../enums/sort-order';

export const paginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(SortOrder).optional(),
	searchTerm: z.string().optional(),
	filters: z.record(z.any(), z.union([z.string(), z.number(), z.boolean()])).optional()
});

export type PaginationDto = z.infer<typeof paginationSchema>;
