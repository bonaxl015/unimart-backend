import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto, createReviewSchema } from './dto/create-review.dto';
import { UpdateReviewDto, updateReviewSchema } from './dto/update-review.dto';
import { PaginationDto, paginationSchema } from '../common/dto/pagination.dto';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';

@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewService: ReviewsService) {}

	@Get('product/:productId')
	getProductReviews(@Param('productId') productId: string, @Query() query: Record<string, string>) {
		const parsedQuery: PaginationDto = paginationSchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder
		});

		return this.reviewService.getProductReviews(productId, parsedQuery);
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
