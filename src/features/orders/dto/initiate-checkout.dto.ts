import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const initiateCheckoutResponseSchema = z.object({
	orderId: z.uuid(),
	clientSecret: z.string()
});

export class InitiateCheckoutResponseDto extends createZodDto(initiateCheckoutResponseSchema) {}
