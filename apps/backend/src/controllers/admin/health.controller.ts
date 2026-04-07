import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { healthService } from '@/services/health.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const getHealth = asyncHandler(async (_req: AppRequest, res: Response) => {
  sendSuccess(res, await healthService.getHealth());
});

export const getReadiness = asyncHandler(async (_req: AppRequest, res: Response) => {
  const readiness = await healthService.getReadiness();
  res.status(readiness.status === 'ready' ? 200 : 503);
  sendSuccess(res, readiness);
});