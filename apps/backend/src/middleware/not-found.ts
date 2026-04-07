import type { Request, Response } from 'express';
import { ApiError } from '@/shared/errors/api-error.js';

export const notFoundHandler = (req: Request, _res: Response) => {
  throw new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
};