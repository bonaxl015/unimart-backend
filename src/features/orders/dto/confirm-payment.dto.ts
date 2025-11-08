import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { orderItemSchema, orderSchema } from './order.dto';

export const confirmPaymentBodySchema = z.object({
	orderId: z.uuid()
});

export const confirmPaymentResponseSchema = orderSchema.extend({
	items: z.array(orderItemSchema)
});

export class ConfirmPaymentBodyDto extends createZodDto(confirmPaymentBodySchema) {}

export class ConfirmPaymentResponseDto extends createZodDto(confirmPaymentResponseSchema) {}
