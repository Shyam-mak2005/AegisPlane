import { Worker } from 'bullmq';
import { createRedisConnection } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

export const subscriptionWorker = new Worker('subscription-checks', async (job) => {
  logger.info({ jobId: job.id, payload: job.data }, 'Subscription check processed');
}, {
  connection: createRedisConnection(),
  prefix: env.QUEUE_PREFIX
});