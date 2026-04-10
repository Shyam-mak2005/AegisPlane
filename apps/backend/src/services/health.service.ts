import mongoose from 'mongoose';
import { getRedisStatus, isRedisConfigured } from '@/config/redis.js';

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
    const redisConfigured = isRedisConfigured();
    const redisReady = !redisConfigured || getRedisStatus() === 'ready';

    return {
      status: mongoReady && redisReady ? 'ready' : 'degraded',
      checks: {
        mongo: mongoReady,
        redis: redisConfigured ? redisReady : 'disabled'
      }
    };
  }
}

export const healthService = new HealthService();
