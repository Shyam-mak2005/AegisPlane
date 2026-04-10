import bcrypt from 'bcryptjs';
import { env } from '@/config/env.js';
import { RoleModel } from '@/models/role.model.js';
import { SubscriptionModel } from '@/models/subscription.model.js';
import { TenantModel } from '@/models/tenant.model.js';
import { UserModel } from '@/models/user.model.js';
import { userRepository } from '@/repositories/user.repository.js';
import { roleRepository } from '@/repositories/role.repository.js';
import { auditService } from '@/services/audit.service.js';
import { ApiError } from '@/shared/errors/api-error.js';
import { tenantRepository } from '@/repositories/tenant.repository.js';
import { subscriptionService } from '@/services/subscription.service.js';

export class TenantService {
  list(query: { page?: number; limit?: number; search?: string }) {
    return tenantRepository.list(query);
  }

  async create(payload: { name: string; slug: string; plan: 'free' | 'pro' | 'enterprise'; adminName: string; adminEmail: string; adminPassword: string }, actorId?: string) {
    const existingTenant = await tenantRepository.findBySlug(payload.slug);
    if (existingTenant) {
      throw new ApiError(409, 'TENANT_EXISTS', 'A tenant with this slug already exists');
    }

    let tenantId: string | undefined;
    let roleId: string | undefined;
    let userId: string | undefined;

    try {
      const tenant = await tenantRepository.create({
        name: payload.name,
        slug: payload.slug,
        plan: payload.plan,
        status: 'active',
        createdBy: actorId
      });
      tenantId = String(tenant._id);

      const adminRole = await roleRepository.create({
        tenantId: tenant._id,
        name: 'Tenant Admin',
        description: 'Full tenant administration rights',
        scope: 'tenant',
        isSystemRole: true,
        permissionKeys: [
          'tenant:read',
          'tenant:update',
          'user:create',
          'user:read',
          'user:update',
          'user:disable',
          'role:create',
          'role:read',
          'role:update',
          'billing:view',
          'featureFlag:read',
          'featureFlag:update',
          'audit:read',
          'subscription:read'
        ]
      });
      roleId = String(adminRole._id);

      const passwordHash = await bcrypt.hash(payload.adminPassword, env.BCRYPT_SALT_ROUNDS);
      const adminUser = await userRepository.create({
        tenantId: tenant._id,
        email: payload.adminEmail,
        passwordHash,
        displayName: payload.adminName,
        roleIds: [adminRole._id],
        status: 'active'
      });
      userId = String(adminUser._id);

      await subscriptionService.upsertForTenant(String(tenant._id), payload.plan);
      await TenantModel.findByIdAndUpdate(tenant._id, { activeUserCount: 1 });

      await auditService.log({
        tenantId: String(tenant._id),
        actorId,
        action: 'tenant.create',
        resourceType: 'tenant',
        resourceId: String(tenant._id),
        metadata: { plan: payload.plan, slug: payload.slug }
      });

      return tenantRepository.findById(String(tenant._id));
    } catch (error) {
      if (userId) {
        await UserModel.deleteOne({ _id: userId });
      }
      if (roleId) {
        await RoleModel.deleteOne({ _id: roleId });
      }
      if (tenantId) {
        await SubscriptionModel.deleteOne({ tenantId });
        await TenantModel.deleteOne({ _id: tenantId });
      }
      throw error;
    }
  }

  async suspend(tenantId: string, actorId?: string) {
    const tenant = await tenantRepository.update(tenantId, { status: 'suspended' });
    if (!tenant) {
      throw new ApiError(404, 'TENANT_NOT_FOUND', 'Tenant was not found');
    }

    await auditService.log({
      tenantId,
      actorId,
      action: 'tenant.suspend',
      resourceType: 'tenant',
      resourceId: tenantId,
      severity: 'warning'
    });
    return tenant;
  }

  async updatePlan(tenantId: string, plan: 'free' | 'pro' | 'enterprise', actorId?: string) {
    const tenant = await tenantRepository.update(tenantId, { plan });
    if (!tenant) {
      throw new ApiError(404, 'TENANT_NOT_FOUND', 'Tenant was not found');
    }

    await subscriptionService.upsertForTenant(tenantId, plan);
    await auditService.log({
      tenantId,
      actorId,
      action: 'tenant.plan.update',
      resourceType: 'subscription',
      resourceId: tenantId,
      metadata: { plan }
    });
    return tenant;
  }
}

export const tenantService = new TenantService();