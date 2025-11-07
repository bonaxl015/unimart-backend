import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { AddCartItemDto, AddCartItemResponseDto, addCartItemSchema } from './dto/add-cart-item.dto';
import {
	UpdateCartItemBodyDto,
	updateCartItemBodySchema,
	UpdateCartItemParamDto,
	UpdateCartItemResponseDto
} from './dto/update-cart-item.dto';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiZodParam } from '../../docs/decorators/api-zod-param.decorator';
import { GlobalErrorDto } from '../../common/dto/global-error.dto';
import { GetCartItemResponseDto } from './dto/get-cart-list.dto';
import { DeleteCartItemDto } from './dto/delete-cart-item.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';

@ApiTags('Cart')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
	constructor(private readonly cartService: CartService) {}

	@Get()
	@ApiOkResponse({ type: GetCartItemResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getCart(@CurrentUser() user: AuthenticatedUser) {
		return this.cartService.getUserCart(user);
	}

	@Post('add')
	@ApiBody({ type: AddCartItemDto })
	@ApiOkResponse({ type: AddCartItemResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	addItem(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedCartItem: AddCartItemDto = addCartItemSchema.parse(body);

		return this.cartService.addItem(user, parsedCartItem);
	}

	@Patch('update/:id')
	@ApiZodParam(UpdateCartItemParamDto)
	@ApiBody({ type: UpdateCartItemBodyDto })
	@ApiOkResponse({ type: UpdateCartItemResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	updateItem(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id') id: string,
		@Body() body: unknown
	) {
		const parsedCartItem: UpdateCartItemBodyDto = updateCartItemBodySchema.parse(body);

		return this.cartService.updateItem(user, id, parsedCartItem);
	}

	@Delete('delete')
	@ApiZodParam(DeleteCartItemDto)
	@ApiOkResponse({ type: DeleteResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	removeItem(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
		return this.cartService.removeItem(user, id);
	}
}
