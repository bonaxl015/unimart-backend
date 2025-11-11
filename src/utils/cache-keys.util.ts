export class CacheKeys {
	static productDetails = (id: string) => `product:${id}:details`;

	static userProfile = (id: string) => `user:${id}:profile`;

	static custom = (namespace: string, id: string) => `${namespace}:${id}`;

	static paged = (
		namespace: string,
		page: number,
		limit: number,
		filters: Record<string, any> = {}
	) => {
		const base = `${namespace}:page:${page}:limit:${limit}`;

		if (filters) {
			const filterString = Object.keys(filters)
				.sort()
				.map((key) => `${key}:${filters[key]}`)
				.join(':');

			return `${base}:filter:${filterString}`;
		}

		return base;
	};
}
