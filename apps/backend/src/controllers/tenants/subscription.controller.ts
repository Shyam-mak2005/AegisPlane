import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { subscriptionService } from '@/services/subscription.service.js';
import { ApiError } from '@/shared/errors/api-error.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const listPlans = asyncHandler(async (_req: AppRequest, res: Response) => {
  sendSuccess(res, subscriptionService.listPlans());
});

export const getTenantSubscription = asyncHandler(async (req: AppRequest, res: Response) => {
  if (!req.auth?.isPlatformAdmin && req.auth?.tenantId !== req.params.tenantId) {
    throw new ApiError(403, 'TENANT_SCOPE_VIOLATION', 'Cross-tenant subscription access is not allowed');
  }

  sendSuccess(res, await subscriptionService.getTenantSubscription(req.params.tenantId));
});