import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { productSchema } from '../../products/dto/product.dto';

export const orderSchema = z.object({
	id: z.uuid(),
	userId: z.uuid(),
	status: z.enum(OrderStatus),
	total: z.string().default('1234'),
	paymentStatus: z.enum(PaymentStatus),
	paymentIntentId: z.uuid(),
	reservedUntil: z.string().nullable().default('2025-11-07T11:42:23.793Z'),
	createdAt: z.string().default('2025-11-07T11:42:23.793Z'),
	updatedAt: z.string().default('2025-11-07T11:42:23.793Z')
});

export const orderItemSchema = z.object({
	id: z.uuid(),
	orderId: z.uuid(),
	productId: z.uuid(),
	quantity: z.number().default(2),
	price: z.string().default('11.89'),
	product: productSchema
});
