import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { CartItem } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemBodyDto } from './dto/update-cart-item.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';

@Injectable()
export class CartService {
	constructor(private readonly prisma: PrismaService) {}

	async getUserCart(user: AuthenticatedUser): Promise<CartItem[]> {
		const userCartList: CartItem[] = await this.prisma.cartItem.findMany({
			where: { userId: user.userId },
			include: { product: true }
		});

		return userCartList;
	}

	async addItem(user: AuthenticatedUser, dto: AddCartItemDto): Promise<CartItem> {
		const product = await this.prisma.product.findUnique({
			where: { id: dto.productId }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		if (product.stock < dto.quantity) {
			throw new ForbiddenException(`Insufficient stock. Only ${product.stock} left`);
		}

		const existingCart = await this.prisma.cartItem.findUnique({
			where: {
				userId_productId: {
					userId: user.userId,
					productId: dto.productId
				}
			}
		});

		if (existingCart) {
			throw new ConflictException('Product already in cart');
		}

		return await this.prisma.cartItem.create({
			data: {
				userId: user.userId,
				productId: dto.productId,
				quantity: dto.quantity
			},
			include: {
				product: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		});
	}

	async updateItem(
		user: AuthenticatedUser,
		itemId: string,
		dto: UpdateCartItemBodyDto
	): Promise<CartItem> {
		const existingCartItem = await this.prisma.cartItem.findUnique({
			where: { id: itemId }
		});

		if (!existingCartItem) {
			throw new NotFoundException('Cart item not found');
		}

		if (existingCartItem.userId !== user.userId) {
			throw new ForbiddenException();
		}

		return await this.prisma.cartItem.update({
			where: { id: itemId },
			data: { quantity: dto.quantity },
			include: { product: true }
		});
	}

	async removeItem(user: AuthenticatedUser, itemId: string): Promise<DeleteResponseDto> {
		const existingCartItem = await this.prisma.cartItem.findUnique({
			where: { id: itemId }
		});

		if (!existingCartItem) {
			throw new NotFoundException('Cart item not found');
		}

		if (existingCartItem.userId !== user.userId) {
			throw new ForbiddenException();
		}

		await this.prisma.cartItem.delete({
			where: { id: itemId }
		});

		return {
			deleted: true,
			message: 'Cart item deleted successfully'
		};
	}
}
