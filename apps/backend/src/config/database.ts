import mongoose from 'mongoose';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI, {
    dbName: 'aegisplane'
  });
  logger.info('MongoDB connected');
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};