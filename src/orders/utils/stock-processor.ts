import { CartItem, PrismaClient, Product } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ITXClientDenyList } from '@prisma/client/runtime/binary';

export class StockProcessor {
	constructor(private readonly prisma: PrismaService) {}

	validateStock(cartItems: (CartItem & { product: Product })[]) {
		for (const item of cartItems) {
			if (item.product.stock < item.quantity) {
				throw new ForbiddenException(
					`Insufficient stock for ${item.product.title}. Available ${item.product.stock}`
				);
			}
		}
	}

	async decrementStock(
		cartItems: (CartItem & { product: Product })[],
		tx: Omit<PrismaClient, ITXClientDenyList>
	) {
		for (const item of cartItems) {
			const product = await tx.product.findUnique({
				where: { id: item.productId }
			});

			if (!product) {
				throw new NotFoundException('Product not found');
			}

			if (product.stock < item.quantity) {
				throw new ForbiddenException(`Stock for ${product.title} ran out during checkout`);
			}

			await tx.product.update({
				where: { id: product.id },
				data: {
					stock: {
						decrement: item.quantity
					}
				}
			});
		}
	}
}
