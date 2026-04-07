import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { roleService } from '@/services/role.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const listRoles = asyncHandler(async (req: AppRequest, res: Response) => {
  sendSuccess(res, await roleService.list(req.tenantContext?.tenantId));
});

export const createRole = asyncHandler(async (req: AppRequest<{ name: string; description?: string; permissionKeys: string[] }>, res: Response) => {
  const role = await roleService.create(req.tenantContext!.tenantId!, req.body, req.auth?.userId);
  res.status(201);
  sendSuccess(res, role);
});

export const updateRole = asyncHandler(async (req: AppRequest<{ description?: string; permissionKeys: string[] }>, res: Response) => {
  sendSuccess(res, await roleService.update(req.params.id, req.tenantContext!.tenantId!, req.body, req.auth?.userId));
});