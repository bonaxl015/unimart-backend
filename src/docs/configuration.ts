import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
	.setTitle('Unimart Backend API')
	.setDescription('Backend API for Unimart e-commerce application')
	.setVersion('1.0.0')
	.addBearerAuth()
	.build();
