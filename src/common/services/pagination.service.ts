import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { SortOrder } from '../enums/sort-order';

@Injectable()
export class PaginationService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Global pagination for any Prisma model
	 *
	 * @param modelDelegate - Prisma delegate (example, this.prisma.product)
	 * @param defaultOrderBy - Default sorting if not provided
	 * @param pagination - pagination, sorting, search and filter options
	 * @param searchableFields - Fields allowed for searchTerm
	 * @param extraWhere - Fixed filters always applied
	 * @param include - Relations to include
	 * @returns Paginated result of the query
	 */
	async paginate<T>(
		modelDelegate: any,
		defaultOrderBy: Record<string, any> = { createdAt: 'desc' },
		pagination: PaginationQueryDto,
		searchableFields: string[] = [],
		extraWhere: Record<string, any> = {},
		include: Record<string, any> = {}
	): Promise<PaginatedResult<T>> {
		const skip = (pagination.page - 1) * pagination.limit;

		// Build where clause
		const where = { ...extraWhere };

		// Apply filters
		if (pagination.filters) {
			Object.assign(where, this.buildFilters(pagination.filters));
		}

		// Apply search
		if (pagination.searchTerm && searchableFields.length > 0) {
			where.OR = searchableFields.map((field) => ({
				[field]: {
					contains: pagination.searchTerm,
					mode: 'insensitive'
				}
			}));
		}

		// Sorting
		const orderBy = pagination.sortBy
			? { [pagination.sortBy]: pagination.sortOrder ?? SortOrder.ASCENDING }
			: defaultOrderBy;

		const [items, total] = await this.prisma.$transaction([
			modelDelegate.findMany({
				where,
				include,
				orderBy,
				skip,
				take: pagination.limit
			}),
			modelDelegate.count({ where })
		]);

		return {
			items,
			total,
			page: pagination.page,
			limit: pagination.limit
		};
	}

	private buildFilters(filters: Record<string, string | number | boolean>) {
		const builtFilters: Record<string, any> = {};

		for (const [key, value] of Object.entries(filters)) {
			const minMatch = key.match(/^min([A-Z][a-zA-Z)-9]*)$/);
			const maxMatch = key.match(/^max([A-Z][a-zA-Z)-9]*)$/);

			if (minMatch) {
				const fieldName = this.lowercaseFirst(minMatch[1]);
				builtFilters[fieldName] = builtFilters[fieldName] || {};
				builtFilters[fieldName].gte = Number(value);
				continue;
			}

			if (maxMatch) {
				const fieldName = this.lowercaseFirst(maxMatch[1]);
				builtFilters[fieldName] = builtFilters[fieldName] || {};
				builtFilters[fieldName].lte = Number(value);
				continue;
			}

			if (filters.inStock) {
				builtFilters.stock = { gt: 0 };
				continue;
			}

			builtFilters[key] = value;
		}

		return builtFilters;
	}

	private lowercaseFirst(str: string) {
		return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
	}
}
