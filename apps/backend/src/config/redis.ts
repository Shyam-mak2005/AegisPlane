import Redis from 'ioredis';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

const RedisClient: any = Redis;

const baseOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  connectTimeout: 5000
};

let sharedRedis: any = null;

const attachErrorHandler = (client: any) => {
  client.on('error', (error: unknown) => {
    logger.warn({ err: error }, 'Redis connection error');
  });

  return client;
};

const getSharedRedis = () => {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!sharedRedis) {
    sharedRedis = attachErrorHandler(new RedisClient(env.REDIS_URL, {
      ...baseOptions,
      lazyConnect: true,
      retryStrategy: () => null
    }));
  }

  return sharedRedis;
};

export const isRedisConfigured = () => Boolean(env.REDIS_URL);

export const createRedisConnection = () => {
  if (!env.REDIS_URL) {
    throw new Error('REDIS_URL is not configured');
  }

  return attachErrorHandler(new RedisClient(env.REDIS_URL, {
    ...baseOptions,
    lazyConnect: false
  }));
};

export const ensureRedisConnection = async (options: { required?: boolean } = {}) => {
  const redis = getSharedRedis();

  if (!redis) {
    if (options.required) {
      throw new Error('REDIS_URL is required but was not provided');
    }

    logger.warn('REDIS_URL is not configured; continuing without Redis-backed queues');
    return false;
  }

  try {
    if (redis.status === 'wait') {
      await redis.connect();
    }

    await redis.ping();
    return true;
  } catch (error) {
    redis.disconnect();
    sharedRedis = null;

    if (options.required) {
      throw error;
    }

    logger.warn({ err: error }, 'Redis is unavailable; continuing in degraded mode without background queues');
    return false;
  }
};

export const getRedisStatus = () => getSharedRedis()?.status ?? 'disabled';
