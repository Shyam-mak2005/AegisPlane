import type { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import type { AppRequest } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';
import { logger } from '@/shared/logger/logger.js';

const normalizeError = (error: Error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return new ApiError(400, 'INVALID_JSON', 'Request body contains invalid JSON');
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new ApiError(400, 'VALIDATION_ERROR', 'Database validation failed', Object.fromEntries(
      Object.entries(error.errors).map(([key, value]) => [key, value.message])
    ));
  }

  if ('code' in error && Number(error.code) === 11000) {
    const duplicateKeys = Object.keys((error as { keyPattern?: Record<string, unknown> }).keyPattern ?? {});
    return new ApiError(409, 'DUPLICATE_KEY', `Duplicate value for ${duplicateKeys.join(', ') || 'unique field'}`);
  }

  return new ApiError(500, 'INTERNAL_SERVER_ERROR', error.message || 'Unexpected server error');
};

export const errorHandler = (error: Error, req: AppRequest, res: Response, _next: NextFunction) => {
  const normalizedError = normalizeError(error);

  logger.error({
    err: error,
    requestId: req.requestId,
    code: normalizedError.code,
    statusCode: normalizedError.statusCode
  }, normalizedError.message);

  res.status(normalizedError.statusCode).json({
    success: false,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details,
      requestId: req.requestId
    }
  });
};