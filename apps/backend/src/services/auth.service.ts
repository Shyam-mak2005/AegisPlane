import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import type { Response } from 'express';
import type { AppRequest, AuthContext } from '@/types/http.js';
import { env, isProduction } from '@/config/env.js';
import { UserModel } from '@/models/user.model.js';
import { ApiError } from '@/shared/errors/api-error.js';
import { sessionRepository } from '@/repositories/session.repository.js';
import { tenantRepository } from '@/repositories/tenant.repository.js';
import { userRepository } from '@/repositories/user.repository.js';
import { rbacService } from '@/services/rbac.service.js';
import { tokenService } from '@/services/token.service.js';
import { auditService } from '@/services/audit.service.js';
import { sha256 } from '@/shared/utils/crypto.js';
import { ttlToMilliseconds } from '@/shared/utils/time.js';

interface LoginInput {
  email: string;
  password: string;
  tenantSlug?: string;
}

interface RefreshInput {
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private getRefreshCookieOptions() {
    const shouldAttachDomain = env.COOKIE_DOMAIN && !['localhost', '127.0.0.1'].includes(env.COOKIE_DOMAIN);

    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: env.COOKIE_SECURE || isProduction,
      ...(shouldAttachDomain ? { domain: env.COOKIE_DOMAIN } : {}),
      path: `${env.API_PREFIX}/auth`,
      expires: new Date(Date.now() + ttlToMilliseconds(env.JWT_REFRESH_TTL))
    };
  }

  private async buildAuthPayload(user: any) {
    const roleIds = (user.roleIds ?? []).map((role: any) => String(role._id ?? role));
    const permissions = user.isPlatformAdmin ? ['*'] : await rbacService.resolvePermissions(roleIds);

    return {
      userId: String(user._id),
      tenantId: user.tenantId ? String(user.tenantId) : undefined,
      sessionId: nanoid(18),
      roleIds,
      permissions,
      isPlatformAdmin: Boolean(user.isPlatformAdmin),
      email: user.email
    };
  }

  private mapUser(user: any, permissions: string[]) {
    return {
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      tenantId: user.tenantId ? String(user.tenantId) : null,
      isPlatformAdmin: user.isPlatformAdmin,
      permissions
    };
  }

  private async issueTokens(user: any, context: { ipAddress?: string; userAgent?: string }, existingSessionId?: string) {
    const payload = await this.buildAuthPayload(user);
    if (existingSessionId) {
      payload.sessionId = existingSessionId;
    }

    const accessToken = tokenService.signAccessToken(payload);
    const refreshToken = tokenService.createRefreshToken();
    await sessionRepository.create({
      tenantId: user.tenantId ?? null,
      userId: user._id,
      sessionId: payload.sessionId,
      family: existingSessionId ?? payload.sessionId,
      tokenHash: refreshToken.hash,
      expiresAt: refreshToken.expiresAt,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });

    return {
      accessToken,
      refreshToken: refreshToken.raw,
      auth: payload
    };
  }

  async login(input: LoginInput, request: AppRequest) {
    const tenantSlug = input.tenantSlug?.trim();
    const tenant = tenantSlug ? await tenantRepository.findBySlug(tenantSlug) : null;

    if (tenantSlug && !tenant) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    const user = await userRepository.findByEmail(input.email, tenant ? String(tenant._id) : null);

    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    if (user.status !== 'active') {
      throw new ApiError(403, 'ACCOUNT_DISABLED', 'User account is not active');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    const tokens = await this.issueTokens(user, {
      ipAddress: request.ip,
      userAgent: request.header('user-agent')
    });

    await auditService.enqueue({
      tenantId: user.tenantId ? String(user.tenantId) : undefined,
      actorId: String(user._id),
      action: 'auth.login',
      resourceType: 'session',
      resourceId: tokens.auth.sessionId,
      metadata: { email: user.email },
      ipAddress: request.ip,
      userAgent: request.header('user-agent')
    });

    return {
      user: this.mapUser(user, tokens.auth.permissions),
      ...tokens
    };
  }

  async refresh(input: RefreshInput) {
    if (!input.refreshToken) {
      throw new ApiError(400, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is required');
    }

    const tokenHash = sha256(input.refreshToken);
    const storedToken = await sessionRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }

    const user = await UserModel.findById(storedToken.userId).populate('roleIds');
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'SESSION_INVALID', 'Session is no longer valid');
    }

    await sessionRepository.revokeById(String(storedToken._id));
    const tokens = await this.issueTokens(user, input, storedToken.sessionId);

    return {
      user: this.mapUser(user, tokens.auth.permissions),
      ...tokens
    };
  }

  async getCurrentUser(auth: AuthContext) {
    const user = await UserModel.findById(auth.userId).populate('roleIds');
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'SESSION_INVALID', 'Session is no longer valid');
    }

    const permissions = user.isPlatformAdmin ? ['*'] : await rbacService.resolvePermissions((user.roleIds ?? []).map((role: any) => String(role._id ?? role)));
    return this.mapUser(user, permissions);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = sha256(refreshToken);
    const storedToken = await sessionRepository.findByTokenHash(tokenHash);

    if (storedToken) {
      await sessionRepository.revokeSession(storedToken.sessionId);
    }
  }

  setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, this.getRefreshCookieOptions());
  }

  clearRefreshCookie(res: Response) {
    const { expires: _expires, ...cookieOptions } = this.getRefreshCookieOptions();
    res.clearCookie('refreshToken', cookieOptions);
  }
}

export const authService = new AuthService();