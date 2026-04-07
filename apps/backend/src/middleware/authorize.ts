import type { NextFunction, Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';

export const authorize = (...requiredPermissions: string[]) => (req: AppRequest, _res: Response, next: NextFunction) => {
  const auth = req.auth;

  if (!auth) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
  }

  if (auth.isPlatformAdmin) {
    return next();
  }

  const hasAllPermissions = requiredPermissions.every((permission) => auth.permissions.includes(permission));

  if (!hasAllPermissions) {
    return next(new ApiError(403, 'FORBIDDEN', 'Insufficient permissions for this action'));
  }

  next();
};