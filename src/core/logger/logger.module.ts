import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Global()
@Module({
	imports: [
		PinoLoggerModule.forRoot({
			pinoHttp: {
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard'
					}
				},
				level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
			}
		})
	],
	exports: [PinoLoggerModule]
})
export class LoggerModule {}
