import './jobs/processors/audit.processor.js';
import './jobs/processors/email.processor.js';
import './jobs/processors/subscription.processor.js';
import './jobs/processors/summary.processor.js';
import { connectDatabase } from '@/config/database.js';
import { connectRedis } from '@/config/redis.js';
import { logger } from '@/shared/logger/logger.js';

const startWorker = async () => {
  await connectDatabase();
  await connectRedis();
  logger.info('AegisPlane worker runtime started');
};

startWorker().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start worker runtime');
  process.exit(1);
});
