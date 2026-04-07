import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { dashboardService } from '@/services/dashboard.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const getDashboardOverview = asyncHandler(async (_req: AppRequest, res: Response) => {
  sendSuccess(res, await dashboardService.getOverview());
});