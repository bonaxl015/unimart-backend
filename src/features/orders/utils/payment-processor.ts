import { PaymentsService } from '../../../core/payments/payments.service';

export class PaymentProcessor {
	constructor(private readonly paymentsService: PaymentsService) {}

	async createPayment(total: number, orderId: string, userId: string) {
		return await this.paymentsService.createPaymentIntent(total, 'php', {
			orderId: orderId,
			userId: userId
		});
	}
}
