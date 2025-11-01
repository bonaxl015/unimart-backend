import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService
	) {}

	async login(data: LoginDto): Promise<{ access_token: string }> {
		const user = await this.prisma.user.findUnique({
			where: { email: data.email }
		});

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const passwordMatches = await bcrypt.compare(data.password, user.password);

		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
		const token = await this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET!,
			expiresIn: '30d'
		});

		return { access_token: token };
	}
}
