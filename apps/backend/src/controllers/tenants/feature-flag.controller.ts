import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { featureFlagService } from '@/services/feature-flag.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

interface FeatureFlagPayload {
  description?: string;
  enabledByDefault?: boolean;
  rolloutPercentage?: number;
  plansEnabled?: string[];
  tenantOverrides?: Array<{ tenantId: string; enabled: boolean }>;
}

export const listFeatureFlags = asyncHandler(async (_req: AppRequest, res: Response) => {
  sendSuccess(res, await featureFlagService.list());
});

export const updateFeatureFlag = asyncHandler(async (req: AppRequest<FeatureFlagPayload>, res: Response) => {
  sendSuccess(res, await featureFlagService.update(req.params.key, req.body, req.auth?.userId));
});