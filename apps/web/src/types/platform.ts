export type PlanKey = 'free' | 'pro' | 'enterprise';
export type StatusTone = 'healthy' | 'warning' | 'critical' | 'active' | 'disabled' | 'trialing';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission?: string;
  platformOnly?: boolean;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: PlanKey;
  status: 'active' | 'suspended' | 'disabled';
  createdAt: string;
  activeUserCount: number;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissionKeys: string[];
  scope: 'tenant' | 'platform';
}

export interface User {
  _id: string;
  tenantId: string;
  displayName: string;
  email: string;
  status: 'active' | 'invited' | 'disabled';
  lastLoginAt?: string | null;
  roleIds: Role[];
}

export interface FeatureFlag {
  _id?: string;
  key: string;
  description: string;
  enabledByDefault: boolean;
  rolloutPercentage: number;
  plansEnabled: PlanKey[];
  tenantOverrides?: Array<{ tenantId: string; enabled: boolean }>;
}

export interface SubscriptionPlan {
  key: PlanKey;
  label: string;
  maxUsers: number;
  apiRateLimitPerMinute: number;
  features: string[];
}

export interface TenantSubscription {
  tenantId: string;
  plan: PlanKey;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  billingCycle: 'monthly' | 'yearly';
  seats: number;
  apiRateLimitPerMinute: number;
  enabledFeatures: string[];
  usageSnapshot: {
    users: number;
    apiRequestsToday: number;
  };
}

export interface AuditLog {
  _id: string;
  createdAt: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  tenantId?: string;
  metadata: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
}

export interface DashboardOverview {
  metrics: {
    totalTenants: number;
    activeUsers: number;
    apiRequestsToday: number;
    systemErrorRate: number;
  };
  tenantGrowth: Array<{ month: string; tenants: number }>;
  apiTraffic: Array<{ label: string; requests: number }>;
  systemHealth: Array<{ label: string; status: string }>;
  recentSystemEvents: AuditLog[];
  topActiveTenants: Tenant[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  permissions: string[];
  tenantId?: string | null;
  isPlatformAdmin: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}