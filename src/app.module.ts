import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReservationCleanerService } from './orders/reservation-cleaner.service';
import { CommonModule } from './common/common.module';
import { LoggerModule } from './logger/logger.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		LoggerModule,
		PrismaModule,
		UsersModule,
		AuthModule,
		ProductsModule,
		CartModule,
		OrdersModule,
		ReviewsModule,
		CommonModule
	],
	providers: [ReservationCleanerService]
})
export class AppModule {}
