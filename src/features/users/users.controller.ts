import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
	CreateUserBodyDto,
	createUserBodySchema,
	CreateUserResponseDto
} from './dto/create-user.dto';
import { GlobalErrorDto } from '../../common/dto/global-error.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('create')
	@ApiBody({ type: CreateUserBodyDto })
	@ApiOkResponse({ type: CreateUserResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	async createUser(@Body() body: unknown) {
		const parsedData: CreateUserBodyDto = createUserBodySchema.parse(body);

		return this.usersService.createUser(parsedData);
	}
}
