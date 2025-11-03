import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { CreateReviewDto, createReviewSchema } from './dto/create-review.dto';
import { UpdateReviewDto, updateReviewSchema } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewService: ReviewsService) {}

	@Get('product/:productId')
	getProductReviews(@Param('productId') productId: string) {
		return this.reviewService.getProductReviews(productId);
	}

	@Get('product/:productId/average')
	getAverageReviews(@Param('productId') productId: string) {
		return this.reviewService.getAverageRating(productId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedBody: CreateReviewDto = createReviewSchema.parse(body);

		return this.reviewService.createReview(user, parsedBody);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('update/:id')
	update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: unknown) {
		const parsedBody: UpdateReviewDto = updateReviewSchema.parse(body);

		return this.reviewService.updateReview(user, id, parsedBody);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('delete/:id')
	delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
		return this.reviewService.deleteReview(user, id);
	}
}
