import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { AddCartItemDto, addCartItemSchema } from './dto/add-cart-item.dto';
import { UpdateCartItemDto, updateCartItemSchema } from './dto/update-cart-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
	constructor(private readonly cartService: CartService) {}

	@Get()
	getCart(@CurrentUser() user: AuthenticatedUser) {
		return this.cartService.getUserCart(user);
	}

	@Post('add')
	addItem(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedCartItem: AddCartItemDto = addCartItemSchema.parse(body);

		return this.cartService.addItem(user, parsedCartItem);
	}

	@Patch('update/:id')
	updateItem(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id') id: string,
		@Body() body: unknown
	) {
		const parsedCartItem: UpdateCartItemDto = updateCartItemSchema.parse(body);

		return this.cartService.updateItem(user, id, parsedCartItem);
	}

	@Delete('delete')
	removeItem(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
		return this.cartService.removeItem(user, id);
	}
}
