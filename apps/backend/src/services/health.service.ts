import mongoose from 'mongoose';

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

    return {
      status: mongoReady ? 'ready' : 'degraded',
      checks: {
        mongo: mongoReady,
        redis: 'disabled'
      }
    };
  }
}

export const healthService = new HealthService();
