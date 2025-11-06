import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, loginSchema } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: unknown) {
		const parsedData: LoginDto = loginSchema.parse(body);

		return this.authService.login(parsedData);
	}
}
