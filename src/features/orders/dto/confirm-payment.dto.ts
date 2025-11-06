import { z } from 'zod';

export const confirmPaymentSchema = z.object({
	orderId: z.uuid()
});

export type ConfirmPaymentDto = z.infer<typeof confirmPaymentSchema>;
