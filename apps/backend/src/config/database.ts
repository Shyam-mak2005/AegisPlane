import mongoose from 'mongoose';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';

export const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(env.MONGO_URI, {
      dbName: 'aegisplane',
      // MongoDB Atlas connection options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    // Set up event listeners for connection monitoring
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      logger.error({ err: error }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });

    logger.info('Database connection established');
  } catch (error) {
    logger.fatal(
      { err: error },
      'Failed to connect to MongoDB. Ensure MONGO_URI is set correctly and MongoDB Atlas cluster is accessible.'
    );
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from MongoDB');
    throw error;
  }
};