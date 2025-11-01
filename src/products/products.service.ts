import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-request.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma, Product, Role } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteResponse } from 'src/types/delete-response.type';

@Injectable()
export class ProductsService {
	constructor(private readonly prisma: PrismaService) {}

	async createProduct(user: AuthenticatedUser, data: CreateProductDto): Promise<Product> {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('This feature is not available to user');
		}

		return await this.prisma.product.create({
			data: {
				...data,
				price: new Prisma.Decimal(data.price),
				ownerId: user.userId
			}
		});
	}

	async getAllProducts(): Promise<Product[]> {
		const productsList: Product[] = await this.prisma.product.findMany();

		return productsList;
	}

	async getProductById(id: string): Promise<Product> {
		const product = await this.prisma.product.findUnique({
			where: { id }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		return product;
	}

	async updateProduct(
		user: AuthenticatedUser,
		id: string,
		data: UpdateProductDto
	): Promise<Product> {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('This feature is not available to user');
		}

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

	async deleteProduct(user: AuthenticatedUser, id: string): Promise<DeleteResponse> {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('This feature is not available to user');
		}

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
}
