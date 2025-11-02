import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { Role } from '@prisma/client';
import { UpdateOrderStatusDto, updateOrderStatusSchema } from './dto/update-order-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post('checkout')
	checkout(@CurrentUser() user: AuthenticatedUser) {
		return this.ordersService.checkout(user);
	}

	@Get('my')
	getMyOrders(@CurrentUser() user: AuthenticatedUser) {
		return this.ordersService.getUserOrders(user);
	}

	@Get('all')
	getAllOrders(@CurrentUser() user: AuthenticatedUser) {
		if (user.role !== Role.ADMIN) {
			throw new Error('This feature is not available to users');
		}

		return this.ordersService.getAllOrders();
	}

	@Patch(':id/status')
	updateStatus(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id') id: string,
		@Body() body: unknown
	) {
		if (user.role !== Role.ADMIN) {
			throw new Error('This feature is not available to users');
		}

		const parsedOrder: UpdateOrderStatusDto = updateOrderStatusSchema.parse(body);

		return this.ordersService.updateOrderStatus(id, parsedOrder);
	}
}
