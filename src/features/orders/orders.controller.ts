import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '@prisma/client';
import { UpdateOrderStatusDto, updateOrderStatusSchema } from './dto/update-order-status.dto';
import { ConfirmPaymentDto, confirmPaymentSchema } from './dto/confirm-payment.dto';
import { PaginationDto, paginationSchema } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post('initiate-checkout')
	initiateCheckout(@CurrentUser() user: AuthenticatedUser) {
		return this.ordersService.initiateCheckout(user);
	}

	@Post('confirm-payment')
	confirmPayment(@Body() body: unknown) {
		const parsedBody: ConfirmPaymentDto = confirmPaymentSchema.parse(body);

		return this.ordersService.confirmPayment(parsedBody.orderId);
	}

	@Get('my')
	getMyOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: Record<string, string>) {
		const parsedQuery: PaginationDto = paginationSchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined
		});

		return this.ordersService.getUserOrders(user, parsedQuery);
	}

	@Get('all')
	@Roles(Role.ADMIN)
	getAllOrders(@Query() query: Record<string, string>) {
		const parsedQuery: PaginationDto = paginationSchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined
		});

		return this.ordersService.getAllOrders(parsedQuery);
	}

	@Patch(':id/status')
	@Roles(Role.ADMIN)
	updateStatus(@Param('id') id: string, @Body() body: unknown) {
		const parsedOrder: UpdateOrderStatusDto = updateOrderStatusSchema.parse(body);

		return this.ordersService.updateOrderStatus(id, parsedOrder);
	}
}
