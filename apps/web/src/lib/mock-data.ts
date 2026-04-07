import type { AuditLog, DashboardOverview, FeatureFlag, Role, SubscriptionPlan, Tenant, User } from '@/types/platform';

export const mockTenants: Tenant[] = [
  {
    _id: 't-1',
    name: 'Northstar Systems',
    slug: 'northstar',
    plan: 'enterprise',
    status: 'active',
    createdAt: '2026-02-12T10:00:00.000Z',
    activeUserCount: 184
  },
  {
    _id: 't-2',
    name: 'Copperframe Labs',
    slug: 'copperframe',
    plan: 'pro',
    status: 'active',
    createdAt: '2026-01-19T08:30:00.000Z',
    activeUserCount: 62
  },
  {
    _id: 't-3',
    name: 'Signal Harbor',
    slug: 'signal-harbor',
    plan: 'free',
    status: 'suspended',
    createdAt: '2025-12-04T14:20:00.000Z',
    activeUserCount: 8
  }
];

export const mockRoles: Role[] = [
  {
    _id: 'r-1',
    name: 'Tenant Admin',
    description: 'Tenant-wide management rights',
    scope: 'tenant',
    permissionKeys: ['tenant:read', 'tenant:update', 'user:create', 'user:read', 'user:update', 'user:disable', 'billing:view', 'audit:read', 'featureFlag:update', 'role:read', 'role:update']
  },
  {
    _id: 'r-2',
    name: 'Billing Analyst',
    description: 'Read-only billing and plan visibility',
    scope: 'tenant',
    permissionKeys: ['billing:view', 'subscription:read', 'audit:read']
  },
  {
    _id: 'r-3',
    name: 'Operator',
    description: 'Operational controls without billing access',
    scope: 'tenant',
    permissionKeys: ['user:read', 'user:update', 'featureFlag:read', 'audit:read']
  }
];

export const mockUsers: User[] = [
  {
    _id: 'u-1',
    tenantId: 't-1',
    displayName: 'Ariana Cole',
    email: 'ariana@northstar.dev',
    status: 'active',
    lastLoginAt: '2026-04-06T08:10:00.000Z',
    roleIds: [mockRoles[0]]
  },
  {
    _id: 'u-2',
    tenantId: 't-1',
    displayName: 'Marcus Lin',
    email: 'marcus@northstar.dev',
    status: 'active',
    lastLoginAt: '2026-04-05T18:24:00.000Z',
    roleIds: [mockRoles[2]]
  },
  {
    _id: 'u-3',
    tenantId: 't-2',
    displayName: 'Priya Sethi',
    email: 'priya@copperframe.ai',
    status: 'disabled',
    lastLoginAt: '2026-03-28T10:18:00.000Z',
    roleIds: [mockRoles[1]]
  }
];

export const mockFeatureFlags: FeatureFlag[] = [
  {
    key: 'advanced_analytics',
    description: 'Cross-tenant usage intelligence and anomaly dashboards',
    enabledByDefault: false,
    rolloutPercentage: 65,
    plansEnabled: ['pro', 'enterprise']
  },
  {
    key: 'team_collaboration',
    description: 'Tenant-shared admin workflows and collaborative tasks',
    enabledByDefault: true,
    rolloutPercentage: 100,
    plansEnabled: ['pro', 'enterprise']
  },
  {
    key: 'api_access',
    description: 'Programmatic access to control plane APIs',
    enabledByDefault: true,
    rolloutPercentage: 100,
    plansEnabled: ['free', 'pro', 'enterprise']
  },
  {
    key: 'audit_logs',
    description: 'Searchable event retention and compliance trails',
    enabledByDefault: true,
    rolloutPercentage: 100,
    plansEnabled: ['free', 'pro', 'enterprise']
  }
];

export const mockPlans: SubscriptionPlan[] = [
  {
    key: 'free',
    label: 'Free',
    maxUsers: 10,
    apiRateLimitPerMinute: 120,
    features: ['api_access', 'audit_logs']
  },
  {
    key: 'pro',
    label: 'Pro',
    maxUsers: 100,
    apiRateLimitPerMinute: 1200,
    features: ['api_access', 'audit_logs', 'advanced_analytics', 'team_collaboration']
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    maxUsers: 1000,
    apiRateLimitPerMinute: 5000,
    features: ['api_access', 'audit_logs', 'advanced_analytics', 'team_collaboration', 'custom_sso']
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    _id: 'a-1',
    createdAt: '2026-04-06T06:10:00.000Z',
    actorId: 'u-1',
    tenantId: 't-1',
    action: 'user.disable',
    resourceType: 'user',
    resourceId: 'u-19',
    metadata: { reason: 'Dormant contractor account' },
    severity: 'warning'
  },
  {
    _id: 'a-2',
    createdAt: '2026-04-06T05:42:00.000Z',
    actorId: 'u-2',
    tenantId: 't-1',
    action: 'featureFlag.update',
    resourceType: 'featureFlag',
    resourceId: 'advanced_analytics',
    metadata: { rolloutPercentage: 65 },
    severity: 'info'
  },
  {
    _id: 'a-3',
    createdAt: '2026-04-05T22:11:00.000Z',
    actorId: 'u-3',
    tenantId: 't-2',
    action: 'auth.login',
    resourceType: 'session',
    resourceId: 's-8',
    metadata: { region: 'ap-south-1' },
    severity: 'info'
  }
];

export const mockDashboardOverview: DashboardOverview = {
  metrics: {
    totalTenants: 148,
    activeUsers: 3821,
    apiRequestsToday: 194203,
    systemErrorRate: 0.014
  },
  tenantGrowth: [
    { month: 'Jan', tenants: 101 },
    { month: 'Feb', tenants: 117 },
    { month: 'Mar', tenants: 133 },
    { month: 'Apr', tenants: 148 }
  ],
  apiTraffic: [
    { label: '00:00', requests: 2400 },
    { label: '06:00', requests: 5400 },
    { label: '12:00', requests: 8100 },
    { label: '18:00', requests: 6900 }
  ],
  systemHealth: [
    { label: 'API', status: 'healthy' },
    { label: 'MongoDB', status: 'healthy' },
    { label: 'Redis', status: 'healthy' }
  ],
  recentSystemEvents: mockAuditLogs,
  topActiveTenants: mockTenants
};