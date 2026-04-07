import { Worker } from 'bullmq';
import { createRedisConnection } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

export const emailWorker = new Worker('email', async (job) => {
  logger.info({ jobId: job.id, payload: job.data }, 'Email job received');
}, {
  connection: createRedisConnection(),
  prefix: env.QUEUE_PREFIX
});