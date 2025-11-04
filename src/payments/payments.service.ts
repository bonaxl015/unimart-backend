import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
	private stripe: Stripe;

	constructor() {
		this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
			apiVersion: '2025-10-29.clover'
		});
	}

	async createPaymentIntent(
		amount: number,
		currency: string,
		metadata: Record<string, string> = {}
	) {
		const paymentIntent = await this.stripe.paymentIntents.create({
			amount: Math.round(amount * 100),
			currency,
			metadata
		});

		return paymentIntent;
	}

	async retrievePaymentIntent(id: string) {
		return this.stripe.paymentIntents.retrieve(id);
	}
}
