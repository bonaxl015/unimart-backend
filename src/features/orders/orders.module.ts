import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentsService } from '../../core/payments/payments.service';

@Module({
	providers: [OrdersService, PaymentsService],
	controllers: [OrdersController]
})
export class OrdersModule {}
