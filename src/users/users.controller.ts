import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('register')
	async register(@Body() body: unknown) {
		const parsedData: CreateUserDto = createUserSchema.parse(body);

		return this.usersService.createUser(parsedData);
	}
}
