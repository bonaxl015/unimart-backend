import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { CreateReviewBodyDto } from './dto/create-review.dto';
import { OrderStatus, Review } from '@prisma/client';
import { UpdateReviewBodyDto } from './dto/update-review.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { CacheKeys } from '../../utils/cache-keys.util';
import { RedisService } from '../../core/redis/redis.service';
import { DEFAULT_LIST_REDIS_TTL } from '../../constants/default-redis-ttl';

@Injectable()
export class ReviewsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly redisService: RedisService
	) {}

	async createReview(user: AuthenticatedUser, dto: CreateReviewBodyDto): Promise<Review> {
		const product = await this.prisma.product.findUnique({
			where: { id: dto.productId }
		});

		if (!product) {
			throw new NotFoundException('Product not found');
		}

		const orderItem = await this.prisma.orderItem.findFirst({
			where: {
				productId: dto.productId,
				order: {
					userId: user.userId,
					status: OrderStatus.COMPLETED
				}
			}
		});

		if (!orderItem) {
			throw new ForbiddenException('You must purchase the product before reviewing');
		}

		const existingReview = await this.prisma.review.findUnique({
			where: {
				productId_userId: {
					productId: dto.productId,
					userId: user.userId
				}
			}
		});

		if (existingReview) {
			throw new ConflictException('You already reviewed this product');
		}

		const newReview = await this.prisma.review.create({
			data: {
				productId: dto.productId,
				userId: user.userId,
				rating: dto.rating,
				comment: dto.comment
			},
			include: {
				user: {
					select: {
						id: true,
						name: true
					}
				}
			}
		});

		await this.redisService.invalidatePages('productReviewList');
		await this.redisService.invalidateKey(CacheKeys.productDetails(dto.productId));

		return newReview;
	}

	async updateReview(
		user: AuthenticatedUser,
		reviewId: string,
		dto: UpdateReviewBodyDto
	): Promise<Review> {
		const review = await this.prisma.review.findUnique({
			where: { id: reviewId }
		});

		if (!review) {
			throw new NotFoundException('Review not found');
		}

		if (review.userId !== user.userId) {
			throw new ForbiddenException('Cannot edit this review');
		}

		const updatedReview = await this.prisma.review.update({
			where: { id: reviewId },
			data: {
				rating: dto.rating,
				comment: dto.comment
			}
		});

		await this.redisService.invalidatePages('productReviewList');
		await this.redisService.invalidateKey(CacheKeys.productDetails(dto.productId));

		return updatedReview;
	}

	async deleteReview(
		user: AuthenticatedUser,
		reviewId: string,
		productId: string
	): Promise<DeleteResponseDto> {
		const review = await this.prisma.review.findUnique({
			where: { id: reviewId }
		});

		if (!review) {
			throw new NotFoundException('Review not found');
		}

		if (review.userId !== user.userId) {
			throw new ForbiddenException('Cannot delete this review');
		}

		await this.prisma.review.delete({
			where: { id: reviewId }
		});

		await this.redisService.invalidatePages('productReviewList');
		await this.redisService.invalidateKey(CacheKeys.productDetails(productId));

		return {
			deleted: true,
			message: 'Review deleted successfully'
		};
	}

	async getProductReviews(
		productId: string,
		pagination: PaginationQueryDto
	): Promise<PaginatedResult<Review>> {
		const cachedKey = CacheKeys.paged('productReviewList', pagination.page, pagination.limit);
		const cache = await this.redisService.get(cachedKey);

		if (cache) {
			return JSON.parse(cache);
		}

		const reviewList = await this.paginationService.paginate<Review>(
			this.prisma.review,
			{ createdAt: 'desc' },
			pagination,
			[],
			{ productId },
			{
				user: {
					select: { id: true, name: true }
				}
			}
		);

		await this.redisService.set(cachedKey, JSON.stringify(reviewList), DEFAULT_LIST_REDIS_TTL);

		return reviewList;
	}

	async getAverageRating(productId: string) {
		const result = await this.prisma.review.aggregate({
			where: { productId },
			_avg: { rating: true }
		});

		return {
			averageRating: result._avg.rating
		};
	}
}
