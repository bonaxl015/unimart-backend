import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit {
	private static client: RedisClientType | null = null;

	private static isConnected = false;

	private static retries = 0;

	constructor(private readonly logger: Logger) {}

	async onModuleInit() {
		if (!process.env.REDIS_URL) {
			this.logger.warn('Redis config not found - running without redis');
			return;
		}

		if (RedisService.client && RedisService.isConnected) {
			this.logger.log('Reusing existing Redis connection');
			return;
		}

		await this.tryConnect();
	}

	async onModuleDestroy() {
		if (RedisService.client && RedisService.isConnected) {
			await RedisService.client.quit();

			this.logger.log('Redis connection closed');
		}
	}

	private async tryConnect(maxRetries = 5, delayMs = 1000) {
		while (RedisService.retries < maxRetries) {
			try {
				this.logger.log(
					`Attempting Redis connection try (${RedisService.retries + 1}/${maxRetries})...`
				);

				const client = createClient({
					url: process.env.REDIS_URL
				});

				client.on('connect', () => {
					this.logger.log('Connected to redis');
					RedisService.isConnected = true;
				});

				client.on('error', (error) => {
					this.logger.error('Redis error: ', error);
				});

				await client.connect();

				RedisService.client = client as RedisClientType;

				return;
			} catch (error) {
				RedisService.retries++;

				this.logger.error(
					`Redis connection failes (attempt ${RedisService.retries}/${maxRetries}): ${error.message}`
				);

				if (RedisService.retries >= maxRetries) {
					this.logger.log(
						`Max Redis connection attemps reaached ${maxRetries}. App will run without caching.`
					);

					RedisService.client = null;
					RedisService.isConnected = false;

					return;
				}

				await this.delay(delayMs);
			}
		}
	}

	private delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	get client(): RedisClientType | null {
		return RedisService.client;
	}

	get isConnected(): boolean {
		return RedisService.isConnected;
	}

	private hasInstance(): boolean {
		return this.isConnected && Boolean(this.client);
	}

	async get(key: string): Promise<string | null | undefined> {
		if (!this.hasInstance()) return null;

		return await (this.client as RedisClientType).get(key);
	}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		if (!this.hasInstance()) return;

		if (ttlSeconds) {
			await (this.client as RedisClientType).set(key, value, { EX: ttlSeconds });
		} else {
			await (this.client as RedisClientType).set(key, value);
		}
	}

	async del(key: string): Promise<void> {
		if (!this.hasInstance()) return;

		await (this.client as RedisClientType).del(key);
	}

	async exists(key: string): Promise<boolean> {
		if (!this.hasInstance()) return false;

		return Number(await (this.client as RedisClientType).exists(key)) > 0;
	}

	async invalidatePages(namespace: string): Promise<void> {
		if (!this.hasInstance()) return;

		const pattern = `${namespace}:page:*`;
		const keys = await (this.client as RedisClientType).keys(pattern);

		if (keys.length > 0) {
			await (this.client as RedisClientType).del(keys);

			this.logger.log(`Invalidated ${keys.length} cached pages for ${namespace}`);
		}
	}

	async invalidateNamespace(namespace: string): Promise<void> {
		if (!this.hasInstance()) return;

		const pattern = `${namespace}:*`;
		const keys = await (this.client as RedisClientType).keys(pattern);

		if (keys.length > 0) {
			await (this.client as RedisClientType).del(keys);

			this.logger.log(`Invalidated ${keys.length} keys for namespace ${namespace}`);
		}
	}

	async invalidateKey(key: string): Promise<void> {
		if (!this.hasInstance()) return;

		await (this.client as RedisClientType).del(key);

		this.logger.log(`Invalidated key ${key}`);
	}
}
