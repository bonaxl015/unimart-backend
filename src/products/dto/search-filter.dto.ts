import { z } from 'zod';

export enum Sort {
	PRICE_ASC = 'price_asc',
	PRICE_DESC = 'price_desc',
	NEWEST = 'newest',
	POPULARITY = 'popularity'
}

export const searchFilterSchema = z.object({
	q: z.string().optional(),
	minPrice: z.number().optional(),
	maxPrice: z.number().optional(),
	categoryId: z.uuid().optional(),
	inStock: z.boolean().optional(),
	sortBy: z.enum(Sort).optional()
});

export type SearchFilterDto = z.infer<typeof searchFilterSchema>;
