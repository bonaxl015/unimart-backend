import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../core/prisma/prisma.module';
import { PaginationService } from './services/pagination.service';

@Global()
@Module({
	imports: [PrismaModule],
	providers: [PaginationService],
	exports: [PaginationService]
})
export class CommonModule {}
