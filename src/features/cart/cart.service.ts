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
import { RedisService } from '../../core/redis/redis.service';
import { CacheKeys } from '../../utils/cache-keys.util';
import { DEFAULT_LIST_REDIS_TTL } from '../../constants/default-redis-ttl';

@Injectable()
export class CartService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly redisService: RedisService
	) {}

	async getUserCart(user: AuthenticatedUser): Promise<CartItem[]> {
		const cachedKey = CacheKeys.custom('cartList:user', user.userId);
		const cache = await this.redisService.get(cachedKey);

		if (cache) {
			return JSON.parse(cache);
		}

		const userCartList: CartItem[] = await this.prisma.cartItem.findMany({
			where: { userId: user.userId },
			include: { product: true }
		});

		await this.redisService.set(cachedKey, JSON.stringify(userCartList), DEFAULT_LIST_REDIS_TTL);

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

		const newCartItem = await this.prisma.cartItem.create({
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

		await this.redisService.invalidateKey(CacheKeys.custom('cartList:user', user.userId));

		return newCartItem;
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

		const updatedCartItem = await this.prisma.cartItem.update({
			where: { id: itemId },
			data: { quantity: dto.quantity },
			include: { product: true }
		});

		await this.redisService.invalidateKey(CacheKeys.custom('cartList:user', user.userId));

		return updatedCartItem;
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

		await this.redisService.invalidateKey(CacheKeys.custom('cartList:user', user.userId));

		return {
			deleted: true,
			message: 'Cart item deleted successfully'
		};
	}
}
