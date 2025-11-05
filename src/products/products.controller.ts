import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import { CreateProductDto, createProductSchema } from './dto/create-product.dto';
import { UpdateProductDto, updateProductSchema } from './dto/update-product.dto';
import { AddProductImageDto, addProductImageSchema } from './dto/add-product-image.dto';
import { Role } from '@prisma/client';
import { UpdateProductStockDto, updateProductStockSchema } from './dto/update-product-stock.dto';
import { SearchFilterDto, searchFilterSchema } from './dto/search-filter.dto';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	getAll() {
		return this.productsService.getAllProducts();
	}

	@Get('search')
	searchAndFilter(@Query() query: Record<string, any>) {
		const filters: SearchFilterDto = searchFilterSchema.parse({
			q: query.q,
			minPrice: query.minPrice ? Number(query.minPrice) : undefined,
			maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
			categoryId: query.categoryId,
			inStock: query.inStock ? query.inStock === 'true' : undefined,
			sortBy: query.sortBy
		});

		return this.productsService.searchAndFilter(filters);
	}

	@Get(':id')
	getProductById(@Param('id') id: string) {
		return this.productsService.getProductById(id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedData: CreateProductDto = createProductSchema.parse(body);

		return this.productsService.createProduct(user, parsedData);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('update/:id')
	update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: unknown) {
		const parsedData: UpdateProductDto = updateProductSchema.parse(body);

		return this.productsService.updateProduct(user, id, parsedData);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('delete/:id')
	delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
		return this.productsService.deleteProduct(user, id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('image')
	addProductImage(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('This feature is not available to user');
		}
		const parsedData: AddProductImageDto = addProductImageSchema.parse(body);

		return this.productsService.addProductImage(parsedData);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('image/:id')
	deleteProductImage(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('This feature is not available to user');
		}

		return this.productsService.deleteProductImage(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('stock/:id')
	updateProductStock(
		@CurrentUser() user: AuthenticatedUser,
		@Param('id') id: string,
		@Body() body: unknown
	) {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('This feature is not available to user');
		}

		const parsedProductStock: UpdateProductStockDto = updateProductStockSchema.parse(body);

		return this.productsService.updateProductStock(id, parsedProductStock);
	}
}
