import type { NextFunction, Response } from 'express';
import type { ZodSchema } from 'zod';
import type { AppRequest } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';

export const validate = <TBody = unknown, TQuery = unknown>(schema: ZodSchema<{ body?: TBody; query?: TQuery }>) => (
  req: AppRequest<TBody, TQuery>,
  _res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse({ body: req.body, query: req.query });

  if (!result.success) {
    return next(new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', result.error.flatten()));
  }

  if (result.data.body) {
    req.body = result.data.body;
  }

  if (result.data.query) {
    req.query = result.data.query as AppRequest<TBody, TQuery>['query'];
  }

  next();
};