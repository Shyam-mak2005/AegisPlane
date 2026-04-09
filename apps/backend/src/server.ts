import { createApp } from '@/app.js';
import { connectDatabase } from '@/config/database.js';
import { connectRedis } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { bootstrapService } from '@/services/bootstrap.service.js';
import { logger } from '@/shared/logger/logger.js';

const start = async () => {
  await connectDatabase();
  await connectRedis();
  await bootstrapService.run();

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`AegisPlane backend listening on port ${env.PORT}`);
  });
};

start().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start backend');
  process.exit(1);
});
