import Redis from 'ioredis';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

const RedisClient: any = Redis;

const maskRedisUrl = (value: string) => value.replace(/\/\/([^:@]+):([^@]+)@/, '//$1:***@');

const createClient = () => new RedisClient(env.REDIS_URL, {
  connectTimeout: 10000,
  enableOfflineQueue: false,
  enableReadyCheck: true,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
});

export const redis = createClient();

redis.on('error', (error: Error) => {
  logger.error({ err: error }, 'Redis connection error');
});

export const connectRedis = async () => {
  try {
    if (redis.status === 'wait') {
      await redis.connect();
    }

    await redis.ping();
    logger.info('Redis connection established');
  } catch (error) {
    logger.fatal(
      {
        err: error,
        redisUrl: maskRedisUrl(env.REDIS_URL)
      },
      'Failed to connect to Redis. Use a reachable managed Redis URL on Render instead of localhost.'
    );
    throw error;
  }
};

export const createRedisConnection = () => {
  const client = createClient();
  client.on('error', (error: Error) => {
    logger.error({ err: error }, 'Redis worker connection error');
  });
  return client;
};
