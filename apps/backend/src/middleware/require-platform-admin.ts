import type { NextFunction, Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';

export const requirePlatformAdmin = (req: AppRequest, _res: Response, next: NextFunction) => {
  if (!req.auth?.isPlatformAdmin) {
    return next(new ApiError(403, 'PLATFORM_ADMIN_REQUIRED', 'Platform administrator privileges are required'));
  }

  next();
};