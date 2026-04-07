export type PlanName = 'free' | 'pro' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'disabled';
export type UserStatus = 'active' | 'invited' | 'disabled';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type RoleScope = 'platform' | 'tenant';

export interface AuthContext {
  userId: string;
  tenantId?: string;
  sessionId: string;
  roleIds: string[];
  permissions: string[];
  isPlatformAdmin: boolean;
  email: string;
}

export interface TenantContext {
  tenantId?: string;
  tenantSlug?: string;
  effectivePlan?: PlanName;
  isPlatformScope: boolean;
}

export type AppRequest<TBody = unknown, TQuery = any, TParams = any> = import('express').Request<
  TParams,
  unknown,
  TBody,
  TQuery
> & {
  auth?: AuthContext;
  tenantContext?: TenantContext;
  requestId?: string;
};

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}