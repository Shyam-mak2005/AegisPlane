import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { auditService } from '@/services/audit.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const listAuditLogs = asyncHandler(async (req: AppRequest<unknown, { page?: number; limit?: number; action?: string; actorId?: string }>, res: Response) => {
  sendSuccess(res, await auditService.list({
    tenantId: req.tenantContext?.isPlatformScope ? undefined : req.tenantContext?.tenantId,
    page: req.query.page,
    limit: req.query.limit,
    action: req.query.action,
    actorId: req.query.actorId
  }));
});