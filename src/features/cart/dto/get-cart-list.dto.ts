import { createZodDto } from 'nestjs-zod';
import { cartItemSchema } from './cart-item.dto';
import { productSchema } from '../../products/dto/product.dto';

export const getCartItemResponseSchema = cartItemSchema.extend({
	product: productSchema
});

export class GetCartItemResponseDto extends createZodDto(getCartItemResponseSchema) {}
