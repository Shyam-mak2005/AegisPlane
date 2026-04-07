import type { NextFunction, Response } from 'express';
import { TenantModel } from '@/models/tenant.model.js';
import type { AppRequest } from '@/types/http.js';
import { ApiError } from '@/shared/errors/api-error.js';

export const tenantContext = async (req: AppRequest, _res: Response, next: NextFunction) => {
  const authTenantId = req.auth?.tenantId;
  const headerTenantId = req.header('x-tenant-id');
  const headerTenantSlug = req.header('x-tenant-slug');

  if (req.auth?.isPlatformAdmin && !headerTenantId && !headerTenantSlug) {
    req.tenantContext = { isPlatformScope: true };
    return next();
  }

  const query = authTenantId
    ? { _id: authTenantId }
    : headerTenantId
      ? { _id: headerTenantId }
      : headerTenantSlug
        ? { slug: headerTenantSlug }
        : undefined;

  if (!query) {
    return next(new ApiError(400, 'TENANT_REQUIRED', 'Tenant context is required'));
  }

  const tenant = await TenantModel.findOne(query).lean();

  if (!tenant) {
    return next(new ApiError(404, 'TENANT_NOT_FOUND', 'Tenant context could not be resolved'));
  }

  if (req.auth?.tenantId && req.auth.tenantId !== String(tenant._id) && !req.auth.isPlatformAdmin) {
    return next(new ApiError(403, 'TENANT_SCOPE_VIOLATION', 'Cross-tenant access is not allowed'));
  }

  req.tenantContext = {
    tenantId: String(tenant._id),
    tenantSlug: tenant.slug,
    effectivePlan: tenant.plan,
    isPlatformScope: false
  };

  next();
};