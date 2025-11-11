import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma, Product, ProductImage } from '@prisma/client';
import { UpdateProductBodyDto } from './dto/update-product.dto';
import { AddProductImageBodyDto } from './dto/add-product-image.dto';
import { UpdateProductStockBodyDto } from './dto/update-product-stock.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { RedisService } from '../../core/redis/redis.service';
import { CacheKeys } from '../../utils/cache-keys.util';
import {
	DEFAULT_DETAILS_REDIS_TTL,
	DEFAULT_LIST_REDIS_TTL
} from '../../constants/default-redis-ttl';

@Injectable()
export class ProductsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly redisService: RedisService
	) {}

	async searchAndFilter(pagination: PaginationQueryDto): Promise<PaginatedResult<Product>> {
		return this.paginationService.paginate<Product>(
			this.prisma.product,
			{ createdAt: 'desc' },
			pagination,
			['title', 'description'],
			{},
			{
				images: true,
				category: true,
				reviews: {
					select: { rating: true }
				}
			}
		);
	}

	async createProduct(user: AuthenticatedUser, data: CreateProductDto): Promise<Product> {
		const newProduct = await this.prisma.product.create({
			data: {
				...data,
				price: new Prisma.Decimal(data.price),
				ownerId: user.userId
			}
		});

		await this.redisService.invalidatePages('productList');

		return newProduct;
	}

	async getAllProducts(pagination: PaginationQueryDto): Promise<PaginatedResult<Product>> {
		const cachedKey = CacheKeys.paged('productList', pagination.page, pagination.limit);
		const cache = await this.redisService.get(cachedKey);

		if (cache) {
			return JSON.parse(cache);
		}

		const data = await this.paginationService.paginate<Product>(
			this.prisma.product,
			{ createdAt: 'desc' },
			pagination,
			[],
			{},
			{ images: true, category: true }
		);

		await this.redisService.set(cachedKey, JSON.stringify(data), DEFAULT_LIST_REDIS_TTL);

		return data;
	}

	async getProductById(id: string): Promise<Product> {
		const cachedKey = CacheKeys.productDetails(id);
		const cache = await this.redisService.get(cachedKey);

		if (cache) {
			return JSON.parse(cache);
		}

		const product = await this.prisma.product.findUnique({
			where: { id },
			include: {
				images: true,
				reviews: {
					include: {
						user: {
							select: {
								id: true,
								name: true
							}
						}
					}
				}
			}
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		await this.redisService.set(cachedKey, JSON.stringify(product), DEFAULT_DETAILS_REDIS_TTL);

		return product;
	}

	async updateProduct(id: string, data: UpdateProductBodyDto): Promise<Product> {
		const existingProduct = await this.prisma.product.findUnique({
			where: { id }
		});

		if (!existingProduct) {
			throw new NotFoundException('Product not found');
		}

		const updatedProduct = await this.prisma.product.update({
			where: { id },
			data: {
				...data,
				price: data.price ? new Prisma.Decimal(data.price) : existingProduct.price
			}
		});

		await this.redisService.invalidateKey(CacheKeys.productDetails(id));
		await this.redisService.invalidatePages('productList');

		return updatedProduct;
	}

	async deleteProduct(id: string): Promise<DeleteResponseDto> {
		const existingProduct = await this.prisma.product.findUnique({
			where: { id }
		});

		if (!existingProduct) {
			throw new NotFoundException('Product not found');
		}

		await this.prisma.product.delete({
			where: { id }
		});

		await this.redisService.invalidateKey(CacheKeys.productDetails(id));
		await this.redisService.invalidatePages('productList');

		return {
			deleted: true,
			message: 'Product deleted successfully'
		};
	}

	async addProductImage(dto: AddProductImageBodyDto): Promise<ProductImage> {
		const product = await this.prisma.product.findUnique({
			where: { id: dto.productId }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		const updatedProductImage = await this.prisma.productImage.create({
			data: {
				productId: dto.productId,
				url: dto.url
			}
		});

		await this.redisService.invalidateKey(CacheKeys.productDetails(dto.productId));
		await this.redisService.invalidatePages('productList');

		return updatedProductImage;
	}

	async deleteProductImage(imageId: string, productId: string): Promise<DeleteResponseDto> {
		const image = await this.prisma.productImage.findUnique({
			where: { id: imageId }
		});

		if (!image) {
			throw new NotFoundException('Product image not found');
		}

		await this.prisma.productImage.delete({
			where: { id: imageId }
		});

		await this.redisService.invalidateKey(CacheKeys.productDetails(productId));
		await this.redisService.invalidatePages('productList');

		return {
			deleted: true,
			message: 'Product image deleted successfully'
		};
	}

	async updateProductStock(productId: string, dto: UpdateProductStockBodyDto): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id: productId }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		const updatedProduct = await this.prisma.product.update({
			where: { id: productId },
			data: { stock: dto.stock }
		});

		await this.redisService.invalidateKey(CacheKeys.productDetails(productId));
		await this.redisService.invalidatePages('productList');

		return updatedProduct;
	}
}
