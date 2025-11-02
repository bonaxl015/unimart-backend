import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async createUser(data: CreateUserDto) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email: data.email }
		});

		if (existingUser) {
			throw new ConflictException('Email already registered');
		}

		const hashedPassword = await bcrypt.hash(data.password, 12);

		const user: Omit<User, 'password' | 'role'> = await this.prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				password: hashedPassword
			},
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return user;
	}
}
