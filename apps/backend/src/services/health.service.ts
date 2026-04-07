import mongoose from 'mongoose';
import { redis } from '@/config/redis.js';

export class HealthService {
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  async getReadiness() {
    const mongoReady = mongoose.connection.readyState === 1;
    const redisReady = redis.status === 'ready';

    return {
      status: mongoReady && redisReady ? 'ready' : 'degraded',
      checks: {
        mongo: mongoReady,
        redis: redisReady
      }
    };
  }
}

export const healthService = new HealthService();