import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { orderItemSchema, orderSchema } from './order.dto';
import { paginationResponseSchema } from '../../../common/dto/pagination.dto';

const getAllOrdersResponseSchema = orderSchema.extend({
	items: z.array(orderItemSchema)
});

export const getAllOrdersPaginatedResponseSchema = paginationResponseSchema(
	getAllOrdersResponseSchema
);

export class GetAllOrderResponseDto extends createZodDto(getAllOrdersPaginatedResponseSchema) {}
