import { SearchFilterDto, Sort } from '../dto/search-filter.dto';

export class SearchQueryBuilder {
	buildWhereClause(filters: SearchFilterDto): Record<string, any> {
		const where: Record<string, any> = {};

		// Keyword search in title and description
		if (filters.q) {
			where.OR = [
				{
					title: {
						contains: filters.q,
						mode: 'insensitive'
					}
				},
				{
					description: {
						contains: filters.q,
						mode: 'insensitive'
					}
				}
			];
		}

		// Category filter
		if (filters.categoryId) {
			where.categoryId = filters.categoryId;
		}

		// Price range filter
		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			where.price = {};

			if (filters.minPrice !== undefined) {
				where.price.gte = filters.minPrice;
			}

			if (filters.maxPrice !== undefined) {
				where.price.lte = filters.maxPrice;
			}
		}

		// Stock availability
		if (filters.inStock) {
			where.stock = { gt: 0 };
		}

		return where;
	}

	buildOrderByClause(sortBy?: Sort): Record<string, string> {
		switch (sortBy) {
			case Sort.PRICE_ASC:
				return { price: 'asc' };
			case Sort.PRICE_DESC:
				return { price: 'desc' };
			case Sort.POPULARITY:
				return { popularity: 'desc' };
			case Sort.NEWEST:
			default:
				return { createdAt: 'desc' };
		}
	}
}
