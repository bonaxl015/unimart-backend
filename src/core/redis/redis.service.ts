import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleInit {
	private client: RedisClientType | null = null;

	private isConnected = false;

	constructor(private readonly logger: Logger) {}

	async onModuleInit() {
		try {
			if (!process.env.REDIS_URL) {
				this.logger.warn('Redis config not found - running without redis');
				return;
			}

			this.client = createClient({
				url: process.env.REDIS_URL
			});

			this.client.on('connect', () => {
				this.logger.log('Connected to redis');
				this.isConnected = true;
			});

			this.client.on('error', (error) => {
				this.logger.error('Redis error: ', error);
				this.isConnected = false;
			});

			await this.client.connect();
		} catch (error) {
			this.logger.error('Failed to connect to Redis: ', error);
			this.isConnected = false;
		}
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
