import {
	CartItem,
	OrderStatus,
	PaymentStatus,
	Prisma,
	PrismaClient,
	Product
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ITXClientDenyList } from '@prisma/client/runtime/binary';
import { MS_TO_MINUTES } from '../../const/time-conversion';

export class OrderProcessor {
	constructor(private readonly prisma: PrismaService) {}

	async createOrder(
		userId: string,
		total: number,
		cartItems: (CartItem & { product: Product })[],
		tx: Omit<PrismaClient, ITXClientDenyList>
	) {
		const reservationMinutes = 15; // 15 minutes
		const reservedUntil = new Date(Date.now() + reservationMinutes * MS_TO_MINUTES);

		return await tx.order.create({
			data: {
				userId: userId,
				total: new Prisma.Decimal(total),
				paymentStatus: PaymentStatus.PENDING,
				status: OrderStatus.PENDING,
				reservedUntil,
				items: {
					create: cartItems.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						price: new Prisma.Decimal(item.product.price)
					}))
				}
			}
		});
	}

	async attachPaymentIntent(
		orderId: string,
		intentId: string,
		tx: Omit<PrismaClient, ITXClientDenyList>
	) {
		return await tx.order.update({
			where: { id: orderId },
			data: {
				paymentIntentId: intentId
			}
		});
	}
}
