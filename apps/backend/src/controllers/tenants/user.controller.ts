import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { userService } from '@/services/user.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const listUsers = asyncHandler(async (req: AppRequest<unknown, { page?: number; limit?: number; search?: string }>, res: Response) => {
  sendSuccess(res, await userService.list(req.tenantContext!.tenantId!, req.query));
});

export const getUserById = asyncHandler(async (req: AppRequest, res: Response) => {
  sendSuccess(res, await userService.getById(req.tenantContext!.tenantId!, req.params.id));
});

export const createUser = asyncHandler(async (req: AppRequest<{ email: string; displayName: string; roleIds: string[] }>, res: Response) => {
  const result = await userService.create(req.tenantContext!.tenantId!, req.body, req.auth?.userId);
  res.status(201);
  sendSuccess(res, result);
});

export const updateUserRoles = asyncHandler(async (req: AppRequest<{ roleIds: string[] }>, res: Response) => {
  sendSuccess(res, await userService.updateRole(req.tenantContext!.tenantId!, req.params.id, req.body.roleIds, req.auth?.userId));
});

export const disableUser = asyncHandler(async (req: AppRequest, res: Response) => {
  sendSuccess(res, await userService.disable(req.tenantContext!.tenantId!, req.params.id, req.auth?.userId));
});

export const resetUserPassword = asyncHandler(async (req: AppRequest, res: Response) => {
  sendSuccess(res, await userService.resetPassword(req.tenantContext!.tenantId!, req.params.id, req.auth?.userId));
});