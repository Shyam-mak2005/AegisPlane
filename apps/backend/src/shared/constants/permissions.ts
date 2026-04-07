export const platformPermissions = [
  'tenant:create',
  'tenant:update',
  'tenant:read',
  'user:create',
  'user:update',
  'user:disable',
  'user:read',
  'role:create',
  'role:update',
  'role:read',
  'billing:view',
  'billing:manage',
  'audit:read',
  'featureFlag:update',
  'featureFlag:read',
  'system:read',
  'subscription:read',
  'subscription:update'
] as const;

export type PermissionKey = (typeof platformPermissions)[number];