import type { Response } from 'express';
import type { AppRequest } from '@/types/http.js';
import { authService } from '@/services/auth.service.js';
import { asyncHandler } from '@/shared/utils/async-handler.js';
import { sendSuccess } from '@/shared/utils/response.js';

export const login = asyncHandler(async (req: AppRequest<{ email: string; password: string; tenantSlug?: string }>, res: Response) => {
  const result = await authService.login(req.body, req);
  authService.setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  });
});

export const refresh = asyncHandler(async (req: AppRequest<{ refreshToken?: string }>, res: Response) => {
  const refreshToken = req.body.refreshToken ?? req.cookies.refreshToken;
  const result = await authService.refresh({
    refreshToken,
    ipAddress: req.ip,
    userAgent: req.header('user-agent')
  });
  authService.setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  });
});

export const getCurrentUser = asyncHandler(async (req: AppRequest, res: Response) => {
  sendSuccess(res, await authService.getCurrentUser(req.auth!));
});

export const logout = asyncHandler(async (req: AppRequest<{ refreshToken?: string }>, res: Response) => {
  const refreshToken = req.body.refreshToken ?? req.cookies.refreshToken;
  await authService.logout(refreshToken);
  authService.clearRefreshCookie(res);
  sendSuccess(res, { loggedOut: true });
});