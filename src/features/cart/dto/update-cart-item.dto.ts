import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { cartItemSchema } from './cart-item.dto';
import { productSchema } from '../../products/dto/product.dto';

export const updateCartItemParamSchema = z.object({
	id: z.uuid()
});

export const updateCartItemBodySchema = z.object({
	quantity: z.number().int().positive().max(100)
});

export const updateCartItemResponseSchema = cartItemSchema.extend({
	product: productSchema,
	user: z.any()
});

export class UpdateCartItemParamDto extends createZodDto(updateCartItemParamSchema) {}

export class UpdateCartItemBodyDto extends createZodDto(updateCartItemBodySchema) {}

export class UpdateCartItemResponseDto extends createZodDto(updateCartItemResponseSchema) {}
