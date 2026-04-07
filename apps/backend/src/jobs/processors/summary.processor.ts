import { Worker } from 'bullmq';
import { createRedisConnection } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

export const summaryWorker = new Worker('scheduled-summaries', async (job) => {
  logger.info({ jobId: job.id, payload: job.data }, 'Summary job processed');
}, {
  connection: createRedisConnection(),
  prefix: env.QUEUE_PREFIX
});