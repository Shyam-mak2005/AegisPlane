import { Queue } from 'bullmq';
import { redis } from '@/config/redis.js';
import { env } from '@/config/env.js';

export const emailQueue = new Queue('email', {
  connection: redis,
  prefix: env.QUEUE_PREFIX
});

export const auditQueue = new Queue('audit', {
  connection: redis,
  prefix: env.QUEUE_PREFIX
});

export const subscriptionQueue = new Queue('subscription-checks', {
  connection: redis,
  prefix: env.QUEUE_PREFIX
});

export const summaryQueue = new Queue('scheduled-summaries', {
  connection: redis,
  prefix: env.QUEUE_PREFIX
});
