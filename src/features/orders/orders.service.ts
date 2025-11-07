import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { Order, OrderStatus, PaymentStatus } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaymentsService } from '../../core/payments/payments.service';
import { CheckoutResponse } from '../../types/checkout-response.type';
import { StockProcessor } from './utils/stock-processor';
import { PaymentProcessor } from './utils/payment-processor';
import { OrderProcessor } from './utils/order-processor';
import { PaginationService } from '../../common/services/pagination.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class OrdersService {
	private stockProcessor: StockProcessor;
	private paymentProcessor: PaymentProcessor;
	private orderProcessor: OrderProcessor;

	constructor(
		private readonly prisma: PrismaService,
		private readonly paymentsService: PaymentsService,
		private readonly paginationService: PaginationService
	) {
		this.stockProcessor = new StockProcessor(prisma);
		this.paymentProcessor = new PaymentProcessor(paymentsService);
		this.orderProcessor = new OrderProcessor(prisma);
	}

	async initiateCheckout(user: AuthenticatedUser): Promise<CheckoutResponse> {
		return await this.prisma.$transaction(async (tx) => {
			const cartItems = await tx.cartItem.findMany({
				where: { userId: user.userId },
				include: { product: true }
			});

			if (cartItems.length === 0) {
				throw new NotFoundException('Cart is empty');
			}

			this.stockProcessor.validateStock(cartItems);

			const total = cartItems.reduce((sum, item) => {
				return sum + parseFloat(item.product.price.toString()) * item.quantity;
			}, 0);

			// Create order with items
			const order = await this.orderProcessor.createOrder(user.userId, total, cartItems, tx);

			await this.stockProcessor.decrementStock(cartItems, tx);

			// Create stripe payment intent
			const paymentIntent = await this.paymentProcessor.createPayment(total, order.id, user.userId);

			await this.orderProcessor.attachPaymentIntent(order.id, paymentIntent.id, tx);

			return {
				orderId: order.id,
				clientSecret: paymentIntent.client_secret
			};
		});
	}

	async confirmPayment(orderId: string): Promise<Order> {
		const now = new Date();

		const order = await this.prisma.order.findUnique({
			where: { id: orderId },
			include: { items: true }
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		// Check if paid
		if (order.paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.COMPLETED) {
			throw new ForbiddenException('Order has already been paid');
		}

		// Check reservation expiry before payment confirmation
		if (order.reservedUntil && order.reservedUntil < now) {
			await this.prisma.order.update({
				where: { id: orderId },
				data: {
					status: OrderStatus.CANCELED,
					paymentStatus: PaymentStatus.FAILED
				}
			});
		}

		// Verify payment
		if (!order.paymentIntentId) {
			throw new ForbiddenException('No payment intent found for this order');
		}

		const paymentIntent = await this.paymentsService.retrievePaymentIntent(order.paymentIntentId);

		if (paymentIntent.status !== 'succeeded') {
			throw new ForbiddenException('Payment not completed');
		}

		// Mark as paid and completed upon successful payment
		const updatedOrder = await this.prisma.order.update({
			where: { id: orderId },
			data: {
				status: OrderStatus.COMPLETED,
				paymentStatus: PaymentStatus.PAID
			},
			include: {
				items: {
					include: { product: true }
				}
			}
		});

		// Clear the cart
		await this.prisma.cartItem.deleteMany({
			where: { userId: order.userId }
		});

		return updatedOrder;
	}

	async getUserOrders(
		user: AuthenticatedUser,
		pagination: PaginationQueryDto
	): Promise<PaginatedResult<Order>> {
		return this.paginationService.paginate(
			this.prisma.order,
			{ createdAt: 'desc' },
			pagination,
			[],
			{ userId: user.userId },
			{
				items: {
					include: { product: true }
				}
			}
		);
	}

	async getAllOrders(pagination: PaginationQueryDto): Promise<PaginatedResult<Order>> {
		return this.paginationService.paginate(
			this.prisma.order,
			{ createdAt: 'desc' },
			pagination,
			[],
			{},
			{
				items: {
					include: { product: true }
				},
				user: {
					select: { email: true, name: true, role: true }
				}
			}
		);
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
