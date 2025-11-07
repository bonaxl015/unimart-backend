import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, loginSchema } from './dto/login.dto';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GlobalErrorDto } from '../../common/dto/global-error.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@ApiBody({ type: LoginDto })
	@ApiOkResponse({ type: LoginResponseDto })
	@ApiBadRequestResponse({ type: GlobalErrorDto })
	async login(@Body() body: unknown) {
		const parsedData: LoginDto = loginSchema.parse(body);

		return this.authService.login(parsedData);
	}
}
