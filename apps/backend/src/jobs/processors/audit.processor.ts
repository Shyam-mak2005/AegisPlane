import { Worker } from 'bullmq';
import { createRedisConnection } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { auditService } from '@/services/audit.service.js';
import { logger } from '@/shared/logger/logger.js';

export const auditWorker = new Worker('audit', async (job) => {
  await auditService.write(job.data);
}, {
  connection: createRedisConnection(),
  prefix: env.QUEUE_PREFIX
});

auditWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Audit job completed');
});