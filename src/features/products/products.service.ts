import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma, Product, ProductImage } from '@prisma/client';
import { UpdateProductBodyDto } from './dto/update-product.dto';
import { DeleteResponse } from '../../types/delete-response.type';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ProductsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService
	) {}

	async searchAndFilter(pagination: PaginationQueryDto): Promise<PaginatedResult<Product>> {
		return this.paginationService.paginate(
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
		return await this.prisma.product.create({
			data: {
				...data,
				price: new Prisma.Decimal(data.price),
				ownerId: user.userId
			}
		});
	}

	async getAllProducts(pagination: PaginationQueryDto): Promise<PaginatedResult<Product>> {
		return await this.paginationService.paginate<Product>(
			this.prisma.product,
			{ createdAt: 'desc' },
			pagination,
			[],
			{},
			{ images: true, category: true }
		);
	}

	async getProductById(id: string): Promise<Product> {
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

		return product;
	}

	async updateProduct(id: string, data: UpdateProductBodyDto): Promise<Product> {
		const existingProduct = await this.prisma.product.findUnique({
			where: { id }
		});

		if (!existingProduct) {
			throw new NotFoundException('Product not found');
		}

		return await this.prisma.product.update({
			where: { id },
			data: {
				...data,
				price: data.price ? new Prisma.Decimal(data.price) : existingProduct.price
			}
		});
	}

	async deleteProduct(id: string): Promise<DeleteResponse> {
		const existingProduct = await this.prisma.product.findUnique({
			where: { id }
		});

		if (!existingProduct) {
			throw new NotFoundException('Product not found');
		}

		await this.prisma.product.delete({
			where: { id }
		});

		return {
			deleted: true,
			message: 'Product deleted successfully'
		};
	}

	async addProductImage(dto: AddProductImageDto): Promise<ProductImage> {
		const product = await this.prisma.product.findUnique({
			where: { id: dto.productId }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return await this.prisma.productImage.create({
			data: {
				productId: dto.productId,
				url: dto.url
			}
		});
	}

	async deleteProductImage(imageId: string): Promise<DeleteResponse> {
		const image = await this.prisma.productImage.findUnique({
			where: { id: imageId }
		});

		if (!image) {
			throw new NotFoundException('Product image not found');
		}

		await this.prisma.productImage.delete({
			where: { id: imageId }
		});

		return {
			deleted: true,
			message: 'Product image deleted successfully'
		};
	}

	async updateProductStock(productId: string, dto: UpdateProductStockDto): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id: productId }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return await this.prisma.product.update({
			where: { id: productId },
			data: { stock: dto.stock }
		});
	}
}
