import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { orderItemSchema, orderSchema } from './order.dto';
import { paginationResponseSchema } from '../../../common/dto/pagination.dto';

const getMyOrdersResponseSchema = orderSchema.extend({
	items: z.array(orderItemSchema)
});

export const getMyOrdersPaginatedResponseSchema =
	paginationResponseSchema(getMyOrdersResponseSchema);

export class GetMyOrderResponseDto extends createZodDto(getMyOrdersPaginatedResponseSchema) {}
