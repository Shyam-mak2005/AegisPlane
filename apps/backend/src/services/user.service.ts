import bcrypt from 'bcryptjs';
import { createSecureToken } from '@/shared/utils/crypto.js';
import { env } from '@/config/env.js';
import { TenantModel } from '@/models/tenant.model.js';
import { ApiError } from '@/shared/errors/api-error.js';
import { auditService } from '@/services/audit.service.js';
import { roleRepository } from '@/repositories/role.repository.js';
import { userRepository } from '@/repositories/user.repository.js';

export class UserService {
  private async validateTenantRoleIds(tenantId: string, roleIds: string[]) {
    const roles = await roleRepository.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new ApiError(400, 'ROLE_NOT_FOUND', 'One or more roles do not exist');
    }

    const invalidRole = roles.some((role) => role.scope !== 'tenant' || String(role.tenantId) !== tenantId);
    if (invalidRole) {
      throw new ApiError(400, 'ROLE_SCOPE_INVALID', 'One or more roles do not belong to this tenant');
    }
  }

  list(tenantId: string, query: { page?: number; limit?: number; search?: string }) {
    return userRepository.list(tenantId, query);
  }

  async getById(tenantId: string, userId: string) {
    const user = await userRepository.findByIdInTenant(userId, tenantId);
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found in this tenant');
    }

    return user;
  }

  async create(tenantId: string, payload: { email: string; displayName: string; roleIds: string[] }, actorId?: string) {
    const existing = await userRepository.findByEmail(payload.email, tenantId);
    if (existing) {
      throw new ApiError(409, 'USER_EXISTS', 'A user with this email already exists in this tenant');
    }

    await this.validateTenantRoleIds(tenantId, payload.roleIds);

    const tempPassword = createSecureToken(12);
    const passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_SALT_ROUNDS);
    const user = await userRepository.create({
      tenantId,
      email: payload.email,
      passwordHash,
      displayName: payload.displayName,
      roleIds: payload.roleIds,
      status: 'invited'
    });

    const activeUserCount = await userRepository.countActiveByTenant(tenantId);
    await TenantModel.findByIdAndUpdate(tenantId, { activeUserCount });

    await auditService.enqueue({
      tenantId,
      actorId,
      action: 'user.create',
      resourceType: 'user',
      resourceId: String(user._id),
      metadata: { email: payload.email }
    });

    return {
      user,
      temporaryPassword: tempPassword
    };
  }

  async updateRole(tenantId: string, userId: string, roleIds: string[], actorId?: string) {
    await this.validateTenantRoleIds(tenantId, roleIds);

    const user = await userRepository.updateInTenant(userId, tenantId, { roleIds });
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found in this tenant');
    }

    await auditService.enqueue({
      tenantId,
      actorId,
      action: 'user.role.update',
      resourceType: 'user',
      resourceId: userId,
      metadata: { roleIds }
    });
    return user;
  }

  async disable(tenantId: string, userId: string, actorId?: string) {
    const user = await userRepository.updateInTenant(userId, tenantId, {
      status: 'disabled',
      disabledAt: new Date()
    });
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found in this tenant');
    }

    const activeUserCount = await userRepository.countActiveByTenant(tenantId);
    await TenantModel.findByIdAndUpdate(tenantId, { activeUserCount });
    await auditService.enqueue({
      tenantId,
      actorId,
      action: 'user.disable',
      resourceType: 'user',
      resourceId: userId,
      severity: 'warning'
    });
    return user;
  }

  async resetPassword(tenantId: string, userId: string, actorId?: string) {
    const tempPassword = createSecureToken(12);
    const passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_SALT_ROUNDS);
    const user = await userRepository.updateInTenant(userId, tenantId, { passwordHash, status: 'active' });
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User was not found in this tenant');
    }

    await auditService.enqueue({
      tenantId,
      actorId,
      action: 'user.password.reset',
      resourceType: 'user',
      resourceId: userId,
      severity: 'critical'
    });
    return {
      user,
      temporaryPassword: tempPassword
    };
  }
}

export const userService = new UserService();