import Redis from 'ioredis';
import { env } from '@/config/env.js';

const RedisClient: any = Redis;

export const redis = new RedisClient(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: false
});

export const createRedisConnection = () => new RedisClient(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});