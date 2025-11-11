import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { ProductsModule } from './features/products/products.module';
import { CartModule } from './features/cart/cart.module';
import { OrdersModule } from './features/orders/orders.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { ReservationCleanerService } from './features/orders/reservation-cleaner.service';
import { CommonModule } from './common/common.module';
import { LoggerModule } from './core/logger/logger.module';
import { AuditLoggerInterceptor } from './common/interceptors/audit-logger.interceptor';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import { RedisModule } from './core/redis/redis.module';

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
		CommonModule,
		RedisModule
	],
	providers: [ReservationCleanerService, AuditLoggerInterceptor, SanitizeInterceptor],
	exports: [AuditLoggerInterceptor, SanitizeInterceptor]
})
export class AppModule {}
