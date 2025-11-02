import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-request.interface';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('create')
	async createUser(@Body() body: unknown) {
		const parsedData: CreateUserDto = createUserSchema.parse(body);

		return this.usersService.createUser(parsedData);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@CurrentUser() user: AuthenticatedUser) {
		return { user };
	}
}
