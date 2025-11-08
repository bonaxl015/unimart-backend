import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '@prisma/client';
import {
	UpdateOrderStatusBodyDto,
	updateOrderStatusBodySchema,
	UpdateOrderStatusParamDto,
	UpdateOrderStatusResponseDto
} from './dto/update-order-status.dto';
import {
	ConfirmPaymentBodyDto,
	confirmPaymentBodySchema,
	ConfirmPaymentResponseDto
} from './dto/confirm-payment.dto';
import { PaginationQueryDto, paginationQuerySchema } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GlobalErrorDto } from '../../common/dto/global-error.dto';
import { InitiateCheckoutResponseDto } from './dto/initiate-checkout.dto';
import { GetMyOrderResponseDto } from './dto/get-my-orders.dto';
import { GetAllOrderResponseDto } from './dto/get-all-orders.dto';
import { ApiZodParam } from '../../docs/decorators/api-zod-param.decorator';
import { ApiZodQuery } from '../../docs/decorators/api-zod-query.decorator';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post('initiate-checkout')
	@ApiOkResponse({ type: InitiateCheckoutResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	initiateCheckout(@CurrentUser() user: AuthenticatedUser) {
		return this.ordersService.initiateCheckout(user);
	}

	@Post('confirm-payment')
	@ApiBody({ type: ConfirmPaymentBodyDto })
	@ApiOkResponse({ type: ConfirmPaymentResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	confirmPayment(@Body() body: unknown) {
		const parsedBody: ConfirmPaymentBodyDto = confirmPaymentBodySchema.parse(body);

		return this.ordersService.confirmPayment(parsedBody.orderId);
	}

	@Get('my')
	@ApiZodQuery(PaginationQueryDto)
	@ApiOkResponse({ type: GetMyOrderResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getMyOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: Record<string, string>) {
		const parsedQuery: PaginationQueryDto = paginationQuerySchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined
		});

		return this.ordersService.getUserOrders(user, parsedQuery);
	}

	@Get('all')
	@Roles(Role.ADMIN)
	@ApiZodQuery(PaginationQueryDto)
	@ApiOkResponse({ type: GetAllOrderResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getAllOrders(@Query() query: Record<string, string>) {
		const parsedQuery: PaginationQueryDto = paginationQuerySchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined
		});

		return this.ordersService.getAllOrders(parsedQuery);
	}

	@Patch(':id/status')
	@Roles(Role.ADMIN)
	@ApiZodParam(UpdateOrderStatusParamDto)
	@ApiOkResponse({ type: UpdateOrderStatusResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	updateStatus(@Param('id') id: string, @Body() body: unknown) {
		const parsedOrder: UpdateOrderStatusBodyDto = updateOrderStatusBodySchema.parse(body);

		return this.ordersService.updateOrderStatus(id, parsedOrder);
	}
}
