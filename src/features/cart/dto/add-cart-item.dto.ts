import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { cartItemSchema } from './cart-item.dto';
import { productSchema } from '../../products/dto/product.dto';

export const addCartItemSchema = z.object({
	productId: z.uuid(),
	quantity: z.number().int().positive().max(100)
});

export const addCartItemResponseSchema = cartItemSchema.extend({
	product: productSchema,
	user: z.any()
});

export class AddCartItemDto extends createZodDto(addCartItemSchema) {}

export class AddCartItemResponseDto extends createZodDto(addCartItemResponseSchema) {}
