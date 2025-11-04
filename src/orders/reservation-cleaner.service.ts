import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReservationCleanerService {
	private readonly logger = new Logger(ReservationCleanerService.name);

	constructor(private readonly prisma: PrismaService) {}

	@Cron('*/1 * * * *') // every minute
	async handleCron() {
		await this.cleanExpiredReservation();
	}

	async cleanExpiredReservation() {
		const now = new Date();

		const expiredOrders = await this.prisma.order.findMany({
			where: {
				status: OrderStatus.PENDING,
				paymentStatus: PaymentStatus.PENDING,
				reservedUntil: { lt: now }
			},
			include: { items: true }
		});

		if (expiredOrders.length === 0) return;

		for (const order of expiredOrders) {
			this.logger.warn(`Cancelling expired order: ${order.id}`);

			// Restore stock
			for (const item of order.items) {
				await this.prisma.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							increment: item.quantity
						}
					}
				});
			}

			await this.prisma.order.update({
				where: { id: order.id },
				data: {
					status: OrderStatus.CANCELED,
					paymentStatus: PaymentStatus.FAILED
				}
			});
		}

		this.logger.log(`Cleaned ${expiredOrders.length} expired reservations`);
	}
}
