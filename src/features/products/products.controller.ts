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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProductDto, createProductSchema } from './dto/create-product.dto';
import { UpdateProductDto, updateProductSchema } from './dto/update-product.dto';
import { AddProductImageDto, addProductImageSchema } from './dto/add-product-image.dto';
import { Role } from '@prisma/client';
import { UpdateProductStockDto, updateProductStockSchema } from './dto/update-product-stock.dto';
import { PaginationDto, paginationSchema } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	getAll(@Query() query: Record<string, string>) {
		const pagination: PaginationDto = paginationSchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder
		});

		return this.productsService.getAllProducts(pagination);
	}

	@Get('search')
	searchAndFilter(@Query() query: Record<string, string>) {
		const pagination: PaginationDto = paginationSchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder,
			searchTerm: query.searchTerm,
			filters: query.filters ? JSON.parse(query.filters) : undefined
		});

		return this.productsService.searchAndFilter(pagination);
	}

	@Get(':id')
	getProductById(@Param('id') id: string) {
		return this.productsService.getProductById(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post('create')
	@Roles(Role.ADMIN)
	create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedData: CreateProductDto = createProductSchema.parse(body);

		return this.productsService.createProduct(user, parsedData);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Patch('update/:id')
	@Roles(Role.ADMIN)
	update(@Param('id') id: string, @Body() body: unknown) {
		const parsedData: UpdateProductDto = updateProductSchema.parse(body);

		return this.productsService.updateProduct(id, parsedData);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('delete/:id')
	@Roles(Role.ADMIN)
	delete(@Param('id') id: string) {
		return this.productsService.deleteProduct(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post('image')
	@Roles(Role.ADMIN)
	addProductImage(@Body() body: unknown) {
		const parsedData: AddProductImageDto = addProductImageSchema.parse(body);

		return this.productsService.addProductImage(parsedData);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('image/:id')
	@Roles(Role.ADMIN)
	deleteProductImage(@Param('id') id: string) {
		return this.productsService.deleteProductImage(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Patch('stock/:id')
	@Roles(Role.ADMIN)
	updateProductStock(@Param('id') id: string, @Body() body: unknown) {
		const parsedProductStock: UpdateProductStockDto = updateProductStockSchema.parse(body);

		return this.productsService.updateProductStock(id, parsedProductStock);
	}
}
