import type { NextFunction, Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';

export const requireTenantScope = (req: AppRequest, _res: Response, next: NextFunction) => {
  if (!req.tenantContext?.tenantId || req.tenantContext.isPlatformScope) {
    return next(new ApiError(400, 'TENANT_REQUIRED', 'A tenant context is required for this route'));
  }

  next();
};