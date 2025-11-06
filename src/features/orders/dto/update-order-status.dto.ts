import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const updateOrderStatusSchema = z.object({
	status: z.enum(OrderStatus)
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
