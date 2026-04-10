import { connectDatabase } from '@/config/database.js';
import { ensureRedisConnection } from '@/config/redis.js';
import { logger } from '@/shared/logger/logger.js';

const startWorker = async () => {
  await connectDatabase();
  await ensureRedisConnection({ required: true });

  await import('./jobs/processors/audit.processor.js');
  await import('./jobs/processors/email.processor.js');
  await import('./jobs/processors/subscription.processor.js');
  await import('./jobs/processors/summary.processor.js');

  logger.info('AegisPlane worker runtime started');
};

startWorker().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start worker runtime');
  process.exit(1);
});
