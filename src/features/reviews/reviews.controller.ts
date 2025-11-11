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
import { ApiTags, ApiBadRequestResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiZodQuery } from '../../docs/decorators/api-zod-query.decorator';
import { ApiZodParam } from '../../docs/decorators/api-zod-param.decorator';
import {
	CreateReviewBodyDto,
	createReviewBodySchema,
	CreateReviewResponseDto
} from './dto/create-review.dto';
import {
	UpdateReviewBodyDto,
	updateReviewBodySchema,
	UpdateReviewParamDto,
	UpdateReviewResponseDto
} from './dto/update-review.dto';
import { PaginationQueryDto, paginationQuerySchema } from '../../common/dto/pagination.dto';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { GlobalErrorDto } from '../../common/dto/global-error.dto';
import { GetReviewParamSchema, GetReviewResponseSchema } from './dto/get-review.dto';
import {
	GetAverageRatingParamSchema,
	GetAverageRatingResponseSchema
} from './dto/get-average-rating.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import {
	deleteReviewBodySchema,
	DeleteReviewBodySchema,
	DeleteReviewParamSchema
} from './dto/delete-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewService: ReviewsService) {}

	@Get('product/:productId')
	@ApiZodParam(GetReviewParamSchema)
	@ApiZodQuery(PaginationQueryDto)
	@ApiOkResponse({ type: GetReviewResponseSchema })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getProductReviews(@Param('productId') productId: string, @Query() query: Record<string, string>) {
		const parsedQuery: PaginationQueryDto = paginationQuerySchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder
		});

		return this.reviewService.getProductReviews(productId, parsedQuery);
	}

	@Get('product/:productId/average')
	@ApiZodParam(GetAverageRatingParamSchema)
	@ApiOkResponse({ type: GetAverageRatingResponseSchema })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getAverageReviews(@Param('productId') productId: string) {
		return this.reviewService.getAverageRating(productId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	@ApiBody({ type: CreateReviewBodyDto })
	@ApiOkResponse({ type: CreateReviewResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedBody: CreateReviewBodyDto = createReviewBodySchema.parse(body);

		return this.reviewService.createReview(user, parsedBody);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('update/:id')
	@ApiZodParam(UpdateReviewParamDto)
	@ApiBody({ type: UpdateReviewBodyDto })
	@ApiOkResponse({ type: UpdateReviewResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: unknown) {
		const parsedBody: UpdateReviewBodyDto = updateReviewBodySchema.parse(body);

		return this.reviewService.updateReview(user, id, parsedBody);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('delete/:id')
	@ApiZodParam(DeleteReviewParamSchema)
	@ApiBody({ type: DeleteReviewBodySchema })
	@ApiOkResponse({ type: DeleteResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: unknown) {
		const parsedBody: DeleteReviewBodySchema = deleteReviewBodySchema.parse(body);

		return this.reviewService.deleteReview(user, id, parsedBody.productId);
	}
}
