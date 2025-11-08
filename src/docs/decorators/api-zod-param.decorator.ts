import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ZodObject, ZodOptional, ZodRawShape } from 'zod';

type ZodDtoConstructor = {
	schema: ZodObject<ZodRawShape>;
	name: string;
};

export function ApiZodParam<T extends ZodDtoConstructor>(dtoConstructor: T) {
	const schema = dtoConstructor.schema;

	if (!schema) {
		throw new Error(
			`Provided DTO class ${dtoConstructor.name} does not have schema static property`
		);
	}

	const decorators = Object.entries(schema.shape).map(([key, zodType]) => {
		const required = !(zodType instanceof ZodOptional);

		return ApiParam({
			name: key,
			type: (zodType as ZodObject<ZodRawShape>).def.type,
			required,
			description: (zodType as ZodObject<ZodRawShape>).description
		});
	});

	return applyDecorators(...decorators);
}
