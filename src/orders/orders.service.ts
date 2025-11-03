import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { Order, Prisma } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	async checkout(user: AuthenticatedUser): Promise<Order> {
		const cartItems = await this.prisma.cartItem.findMany({
			where: { userId: user.userId },
			include: { product: true }
		});

		if (cartItems.length === 0) {
			throw new NotFoundException('Cart is empty');
		}

		for (const item of cartItems) {
			if (item.product.stock < item.quantity) {
				throw new ForbiddenException(
					`Insufficient stock for ${item.product.title}. Available ${item.product.stock}`
				);
			}
		}

		const total = cartItems.reduce((sum, item) => {
			return sum + parseFloat(item.product.price.toString()) * item.quantity;
		}, 0);

		// Create order with items
		const order = await this.prisma.order.create({
			data: {
				userId: user.userId,
				total: new Prisma.Decimal(total),
				items: {
					create: cartItems.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						price: new Prisma.Decimal(item.product.price)
					}))
				}
			},
			include: {
				items: {
					include: { product: true }
				},
				user: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			}
		});

		// Decrement stock
		for (const item of cartItems) {
			await this.prisma.product.update({
				where: { id: item.productId },
				data: {
					stock: {
						decrement: item.quantity
					}
				}
			});
		}

		// Clear the cart
		await this.prisma.cartItem.deleteMany({
			where: { userId: user.userId }
		});

		return order;
	}

	async getUserOrders(user: AuthenticatedUser): Promise<Order[]> {
		const orderList: Order[] = await this.prisma.order.findMany({
			where: { userId: user.userId },
			include: {
				items: {
					include: { product: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		return orderList;
	}

	async getAllOrders(): Promise<Order[]> {
		const orderList: Order[] = await this.prisma.order.findMany({
			include: {
				items: {
					include: { product: true }
				},
				user: {
					select: {
						email: true,
						name: true,
						role: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		return orderList;
	}

	async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<Order> {
		const existingOrder = await this.prisma.order.findUnique({
			where: { id: orderId },
			include: {
				items: {
					include: { product: true }
				},
				user: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			}
		});

		if (!existingOrder) {
			throw new NotFoundException('Order not found');
		}

		const updateOrderStatus = await this.prisma.order.update({
			where: { id: orderId },
			data: {
				status: dto.status
			},
			include: {
				items: {
					include: { product: true }
				},
				user: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			}
		});

		return updateOrderStatus;
	}
}
