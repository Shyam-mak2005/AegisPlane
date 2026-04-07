import bcrypt from 'bcryptjs';
import { FeatureFlagModel } from '@/models/feature-flag.model.js';
import { PermissionModel } from '@/models/permission.model.js';
import { RoleModel } from '@/models/role.model.js';
import { TenantModel } from '@/models/tenant.model.js';
import { UserModel } from '@/models/user.model.js';
import { env, isProduction } from '@/config/env.js';
import { platformPermissions } from '@/shared/constants/permissions.js';
import { subscriptionService } from '@/services/subscription.service.js';

export class BootstrapService {
  async run() {
    await Promise.all(platformPermissions.map((key) => {
      const [resource, action] = key.split(':');
      return PermissionModel.updateOne({ key }, {
        key,
        resource,
        action,
        scope: resource === 'tenant' || resource === 'system' ? 'platform' : 'tenant'
      }, { upsert: true });
    }));

    const platformRole = await RoleModel.findOneAndUpdate({ name: 'Platform Admin', scope: 'platform' }, {
      name: 'Platform Admin',
      scope: 'platform',
      isSystemRole: true,
      description: 'Platform-wide administrative role',
      permissionKeys: [...platformPermissions]
    }, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    const passwordHash = await bcrypt.hash(env.PLATFORM_ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
    await UserModel.updateOne({ email: env.PLATFORM_ADMIN_EMAIL, isPlatformAdmin: true }, {
      email: env.PLATFORM_ADMIN_EMAIL,
      displayName: 'Platform Administrator',
      passwordHash,
      isPlatformAdmin: true,
      status: 'active',
      roleIds: [platformRole._id],
      tenantId: null
    }, { upsert: true });

    await Promise.all([
      FeatureFlagModel.updateOne({ key: 'advanced_analytics' }, {
        key: 'advanced_analytics',
        description: 'Cross-tenant analytics dashboards',
        enabledByDefault: false,
        plansEnabled: ['pro', 'enterprise'],
        rolloutPercentage: 100
      }, { upsert: true }),
      FeatureFlagModel.updateOne({ key: 'team_collaboration' }, {
        key: 'team_collaboration',
        description: 'Tenant collaboration controls and shared workspaces',
        enabledByDefault: true,
        plansEnabled: ['pro', 'enterprise'],
        rolloutPercentage: 100
      }, { upsert: true }),
      FeatureFlagModel.updateOne({ key: 'api_access' }, {
        key: 'api_access',
        description: 'Programmatic API access',
        enabledByDefault: true,
        plansEnabled: ['free', 'pro', 'enterprise'],
        rolloutPercentage: 100
      }, { upsert: true }),
      FeatureFlagModel.updateOne({ key: 'audit_logs' }, {
        key: 'audit_logs',
        description: 'Structured audit log retention and search',
        enabledByDefault: true,
        plansEnabled: ['free', 'pro', 'enterprise'],
        rolloutPercentage: 100
      }, { upsert: true })
    ]);

    const bootstrapTenant = await TenantModel.findOneAndUpdate({ slug: 'aegisplane-internal' }, {
      name: 'AegisPlane Internal',
      slug: 'aegisplane-internal',
      status: 'active',
      plan: 'enterprise'
    }, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    await subscriptionService.upsertForTenant(String(bootstrapTenant._id), 'enterprise');

    if (!isProduction) {
      const tenantAdminRole = await RoleModel.findOneAndUpdate({ tenantId: bootstrapTenant._id, name: 'Tenant Admin' }, {
        tenantId: bootstrapTenant._id,
        name: 'Tenant Admin',
        description: 'Internal tenant administrative access',
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
          'audit:read',
          'subscription:read'
        ]
      }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      });

      const operatorRole = await RoleModel.findOneAndUpdate({ tenantId: bootstrapTenant._id, name: 'Support Operator' }, {
        tenantId: bootstrapTenant._id,
        name: 'Support Operator',
        description: 'Operational support with limited mutating permissions',
        scope: 'tenant',
        isSystemRole: true,
        permissionKeys: ['user:read', 'audit:read', 'featureFlag:read', 'subscription:read']
      }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      });

      await UserModel.updateOne({ email: 'tenant.admin@aegisplane.dev', tenantId: bootstrapTenant._id }, {
        email: 'tenant.admin@aegisplane.dev',
        displayName: 'Internal Tenant Admin',
        passwordHash,
        tenantId: bootstrapTenant._id,
        status: 'active',
        roleIds: [tenantAdminRole._id]
      }, { upsert: true });

      await UserModel.updateOne({ email: 'operator@aegisplane.dev', tenantId: bootstrapTenant._id }, {
        email: 'operator@aegisplane.dev',
        displayName: 'Internal Support Operator',
        passwordHash,
        tenantId: bootstrapTenant._id,
        status: 'active',
        roleIds: [operatorRole._id]
      }, { upsert: true });

      const activeUserCount = await UserModel.countDocuments({ tenantId: bootstrapTenant._id, status: 'active' });
      await TenantModel.findByIdAndUpdate(bootstrapTenant._id, { activeUserCount });
    }
  }
}

export const bootstrapService = new BootstrapService();