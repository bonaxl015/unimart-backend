import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const getAverageRatingParamSchema = z.object({
	productId: z.uuid()
});

export const getAverageRatingResponseSchema = z.object({
	averageRating: z.number().nullable()
});

export class GetAverageRatingParamSchema extends createZodDto(getAverageRatingParamSchema) {}

export class GetAverageRatingResponseSchema extends createZodDto(getAverageRatingResponseSchema) {}
