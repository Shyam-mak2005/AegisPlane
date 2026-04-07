import { Queue } from 'bullmq';
import { createRedisConnection } from '@/config/redis.js';
import { env } from '@/config/env.js';

const queueConnection = createRedisConnection();

export const emailQueue = new Queue('email', {
  connection: queueConnection,
  prefix: env.QUEUE_PREFIX
});

export const auditQueue = new Queue('audit', {
  connection: queueConnection,
  prefix: env.QUEUE_PREFIX
});

export const subscriptionQueue = new Queue('subscription-checks', {
  connection: queueConnection,
  prefix: env.QUEUE_PREFIX
});

export const summaryQueue = new Queue('scheduled-summaries', {
  connection: queueConnection,
  prefix: env.QUEUE_PREFIX
});