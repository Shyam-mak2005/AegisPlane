import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { tenantService } from '@/services/tenant.service.js';
import { tenantRepository } from '@/repositories/tenant.repository.js';
import { ApiError } from '@/shared/errors/api-error.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const listTenants = asyncHandler(async (req: AppRequest<unknown, { page?: number; limit?: number; search?: string }>, res: Response) => {
  sendSuccess(res, await tenantService.list(req.query));
});

export const createTenant = asyncHandler(async (req: AppRequest<{ name: string; slug: string; plan: 'free' | 'pro' | 'enterprise'; adminName: string; adminEmail: string; adminPassword: string }>, res: Response) => {
  const tenant = await tenantService.create(req.body, req.auth?.userId);
  res.status(201);
  sendSuccess(res, tenant);
});

export const getTenantById = asyncHandler(async (req: AppRequest, res: Response) => {
  const tenant = await tenantRepository.findById(req.params.id);
  if (!tenant) {
    throw new ApiError(404, 'TENANT_NOT_FOUND', 'Tenant was not found');
  }

  sendSuccess(res, tenant);
});

export const suspendTenant = asyncHandler(async (req: AppRequest, res: Response) => {
  sendSuccess(res, await tenantService.suspend(req.params.id, req.auth?.userId));
});

export const updateTenantPlan = asyncHandler(async (req: AppRequest<{ plan: 'free' | 'pro' | 'enterprise' }>, res: Response) => {
  sendSuccess(res, await tenantService.updatePlan(req.params.id, req.body.plan, req.auth?.userId));
});