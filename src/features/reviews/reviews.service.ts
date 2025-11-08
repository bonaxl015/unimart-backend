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
import { DeleteResponse } from '../../types/delete-response.type';
import { PaginationService } from '../../common/services/pagination.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ReviewsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService
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

		return await this.prisma.review.create({
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

		return await this.prisma.review.update({
			where: { id: reviewId },
			data: {
				rating: dto.rating,
				comment: dto.comment
			}
		});
	}

	async deleteReview(user: AuthenticatedUser, reviewId: string): Promise<DeleteResponse> {
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

		return {
			deleted: true,
			message: 'Review deleted successfully'
		};
	}

	async getProductReviews(
		productId: string,
		pagination: PaginationQueryDto
	): Promise<PaginatedResult<Review>> {
		return this.paginationService.paginate(
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
