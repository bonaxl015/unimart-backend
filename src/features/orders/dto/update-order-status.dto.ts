import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { OrderStatus } from '@prisma/client';
import { orderItemSchema, orderSchema } from './order.dto';

export const updateOrderStatusParamSchema = z.object({
	id: z.uuid()
});

export const updateOrderStatusBodySchema = z.object({
	status: z.enum(OrderStatus)
});

export const updateOrderStatusResponseSchema = orderSchema.extend({
	items: z.array(orderItemSchema),
	user: z.any()
});

export class UpdateOrderStatusParamDto extends createZodDto(updateOrderStatusParamSchema) {}

export class UpdateOrderStatusBodyDto extends createZodDto(updateOrderStatusBodySchema) {}

export class UpdateOrderStatusResponseDto extends createZodDto(updateOrderStatusResponseSchema) {}
