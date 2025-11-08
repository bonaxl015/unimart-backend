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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';
import {
	CreateProductDto,
	CreateProductResponseDto,
	createProductSchema
} from './dto/create-product.dto';
import {
	UpdateProductBodyDto,
	updateProductBodySchema,
	UpdateProductParamDto,
	UpdateProductResponseDto
} from './dto/update-product.dto';
import {
	AddProductImageBodyDto,
	addProductImageBodySchema,
	AddProductImageResponseDto
} from './dto/add-product-image.dto';
import { Role } from '@prisma/client';
import {
	UpdateProductStockBodyDto,
	updateProductStockBodySchema,
	UpdateProductStockParamDto,
	UpdateProductStockResponseDto
} from './dto/update-product-stock.dto';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags
} from '@nestjs/swagger';
import { ApiZodQuery } from '../../docs/decorators/api-zod-query.decorator';
import { ApiZodParam } from '../../docs/decorators/api-zod-param.decorator';
import { ProductSearchResponseDto } from './dto/search-product.dto';
import { DeleteResponseDto } from '../../common/dto/delete-response.dto';
import { DeleteProductParamDto } from './dto/delete-product.dto';
import { DeleteProductImageParamDto } from './dto/delete-product-image.dto';
import { GetAllProductResponseDto } from './dto/get-all-product.dto';
import { GlobalErrorDto } from '../../common/dto/global-error.dto';
import { GetByIdProductParamDto, GetByIdProductResponseDto } from './dto/get-by-id-product.dto';
import { PaginationQueryDto, paginationQuerySchema } from '../../common/dto/pagination.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@ApiZodQuery(PaginationQueryDto)
	@ApiOkResponse({ type: GetAllProductResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getAll(@Query() query: Record<string, string>) {
		const pagination: PaginationQueryDto = paginationQuerySchema.parse({
			page: query.page ? Number(query.page) : undefined,
			limit: query.limit ? Number(query.limit) : undefined,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder
		});

		return this.productsService.getAllProducts(pagination);
	}

	@Get('search')
	@ApiZodQuery(PaginationQueryDto)
	@ApiOkResponse({ type: ProductSearchResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	searchAndFilter(@Query() query: Record<string, string>) {
		const pagination: PaginationQueryDto = paginationQuerySchema.parse({
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
	@ApiZodParam(GetByIdProductParamDto)
	@ApiOkResponse({ type: GetByIdProductResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	getProductById(@Param('id') id: string) {
		return this.productsService.getProductById(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post('create')
	@Roles(Role.ADMIN)
	@ApiBody({ type: CreateProductDto })
	@ApiCreatedResponse({ type: CreateProductResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
		const parsedData: CreateProductDto = createProductSchema.parse(body);

		return this.productsService.createProduct(user, parsedData);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Patch('update/:id')
	@Roles(Role.ADMIN)
	@ApiZodParam(UpdateProductParamDto)
	@ApiBody({ type: UpdateProductBodyDto })
	@ApiOkResponse({ type: UpdateProductResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	update(@Param('id') id: string, @Body() body: unknown) {
		const parsedData: UpdateProductBodyDto = updateProductBodySchema.parse(body);

		return this.productsService.updateProduct(id, parsedData);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('delete/:id')
	@Roles(Role.ADMIN)
	@ApiZodParam(DeleteProductParamDto)
	@ApiOkResponse({ type: DeleteResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	delete(@Param('id') id: string) {
		return this.productsService.deleteProduct(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Post('image')
	@Roles(Role.ADMIN)
	@ApiBody({ type: AddProductImageBodyDto })
	@ApiOkResponse({ type: AddProductImageResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	addProductImage(@Body() body: unknown) {
		const parsedData: AddProductImageBodyDto = addProductImageBodySchema.parse(body);

		return this.productsService.addProductImage(parsedData);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Delete('image/:id')
	@Roles(Role.ADMIN)
	@ApiZodParam(DeleteProductImageParamDto)
	@ApiOkResponse({ type: DeleteResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	deleteProductImage(@Param('id') id: string) {
		return this.productsService.deleteProductImage(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Patch('stock/:id')
	@Roles(Role.ADMIN)
	@ApiZodParam(UpdateProductStockParamDto)
	@ApiBody({ type: UpdateProductStockBodyDto })
	@ApiOkResponse({ type: UpdateProductStockResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	updateProductStock(@Param('id') id: string, @Body() body: unknown) {
		const parsedProductStock: UpdateProductStockBodyDto = updateProductStockBodySchema.parse(body);

		return this.productsService.updateProductStock(id, parsedProductStock);
	}
}
