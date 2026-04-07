import jwt from 'jsonwebtoken';
import type { NextFunction, Response } from 'express';
import { env } from '@/config/env.js';
import type { AppRequest, AuthContext } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';

export const authenticate = (req: AppRequest, _res: Response, next: NextFunction) => {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing bearer token'));
  }

  try {
    const payload = jwt.verify(authorization.slice(7), env.JWT_ACCESS_SECRET) as AuthContext;
    req.auth = payload;
    next();
  } catch {
    next(new ApiError(401, 'INVALID_TOKEN', 'Access token is invalid or expired'));
  }
};