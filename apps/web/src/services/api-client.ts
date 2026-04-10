import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';
import type { 
  ApiErrorPayload, AuthSession, DashboardOverview, FeatureFlag, 
  PaginatedResponse, PlanKey, Role, SubscriptionPlan, Tenant, 
  TenantSubscription, User, AuditLog 
} from '@/types/platform';

export class ApiClientError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message ?? 'Request failed');
    this.status = status;
    this.payload = payload;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string || '').replace(/\/$/, '');
const API_PREFIX = API_BASE_URL.includes('/api/v1') ? API_BASE_URL : `${API_BASE_URL}/api/v1`;

const getDefaultRoute = (permissions: string[], isPlatformAdmin: boolean) => {
  if (isPlatformAdmin || permissions.includes('system:read')) return '/dashboard';
  if (permissions.includes('user:read')) return '/users';
  if (permissions.includes('audit:read')) return '/audit-logs';
  if (permissions.includes('billing:view')) return '/billing';
  return '/settings';
};

const parsePayload = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const payload = contentType?.includes('application/json') ? await response.json() : {};
  if (!response.ok) {
    throw new ApiClientError(response.status, payload.error || payload);
  }
  return payload.data as T;
};

// Race condition protection
let isRefreshing = false;
let refreshPromise: Promise<AuthSession> | null = null;

const request = async <T>(path: string, options: RequestInit & { tenantId?: string; skipAuth?: boolean; retryOn401?: boolean } = {}): Promise<T> => {
  const { tenantId, skipAuth = false, retryOn401 = true, headers, body, ...rest } = options;
  const { accessToken, clearSession, setSession } = useAppStore.getState();
  const requestHeaders = new Headers(headers);

  if (!skipAuth && accessToken) {
    requestHeaders.set('authorization', `Bearer ${accessToken}`);
  }
  if (tenantId) {
    requestHeaders.set('x-tenant-id', tenantId);
  }
  if (body && !requestHeaders.has('content-type')) {
    requestHeaders.set('content-type', 'application/json');
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...rest,
    headers: requestHeaders,
    body,
    credentials: 'include'
  });

  if (response.status === 401 && !skipAuth && retryOn401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = apiClient.refreshSession().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    try {
      const session = await refreshPromise!;
      setSession(session);
      return request<T>(path, { ...options, retryOn401: false });
    } catch {
      clearSession();
      throw new ApiClientError(401, { code: 'SESSION_EXPIRED', message: 'Your session has expired.' });
    }
  }

  return parsePayload<T>(response);
};

export const apiClient = {
  login: (payload: { email: string; password: string; tenantSlug?: string }) => 
    request<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(payload), skipAuth: true, retryOn401: false }),
  
  refreshSession: () => 
    request<AuthSession>('/auth/refresh', { method: 'POST', body: JSON.stringify({}), skipAuth: true, retryOn401: false }),
  
  getCurrentUser: () => request<AuthSession['user']>('/auth/me'),
  logout: () => request<{ loggedOut: boolean }>('/auth/logout', { method: 'POST', body: JSON.stringify({}) }),
  getDashboardOverview: () => request<DashboardOverview>('/dashboard'),
  getTenants: () => request<PaginatedResponse<Tenant>>('/tenants'),
  createTenant: (payload: any) => request<Tenant>('/tenants', { method: 'POST', body: JSON.stringify(payload) }),
  suspendTenant: (tenantId: string) => request<Tenant>(`/tenants/${tenantId}/suspend`, { method: 'POST' }),
  updateTenantPlan: (tenantId: string, plan: PlanKey) => request<Tenant>(`/tenants/${tenantId}/plan`, { method: 'PATCH', body: JSON.stringify({ plan }) }),
  getUsers: (tenantId: string) => request<PaginatedResponse<User>>('/users', { tenantId }),
  createUser: (tenantId: string, payload: any) => request<{ user: User; temporaryPassword: string }>('/users', { method: 'POST', tenantId, body: JSON.stringify(payload) }),
  getUser: (tenantId: string, userId: string) => request<User>(`/users/${userId}`, { tenantId }),
  updateUserRoles: (tenantId: string, userId: string, roleIds: string[]) => request<User>(`/users/${userId}/roles`, { method: 'PATCH', tenantId, body: JSON.stringify({ roleIds }) }),
  disableUser: (tenantId: string, userId: string) => request<User>(`/users/${userId}/disable`, { method: 'POST', tenantId }),
  resetUserPassword: (tenantId: string, userId: string) => request<{ user: User; temporaryPassword: string }>(`/users/${userId}/reset-password`, { method: 'POST', tenantId }),
  getRoles: (tenantId: string) => request<Role[]>('/roles', { tenantId }),
  updateRole: (tenantId: string, roleId: string, payload: any) => request<Role>(`/roles/${roleId}`, { method: 'PATCH', tenantId, body: JSON.stringify(payload) }),
  getFeatureFlags: () => request<FeatureFlag[]>('/features'),
  updateFeatureFlag: (key: string, payload: Partial<FeatureFlag>) => request<FeatureFlag>(`/features/${key}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getPlans: () => request<SubscriptionPlan[]>('/subscriptions/plans'),
  getTenantSubscription: (tenantId: string) => request<TenantSubscription>(`/subscriptions/tenant/${tenantId}`, { tenantId }),
  getAuditLogs: (tenantId: string) => request<PaginatedResponse<AuditLog>>('/audit-logs', { tenantId })
};

// Hooks Export
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  tenants: ['tenants'] as const,
  users: (tenantId: string) => ['users', tenantId] as const,
  user: (tenantId: string, userId: string) => ['user', tenantId, userId] as const,
  roles: (tenantId: string) => ['roles', tenantId] as const,
  features: ['features'] as const,
  plans: ['plans'] as const,
  subscription: (tenantId: string) => ['subscription', tenantId] as const,
  auditLogs: (tenantId: string) => ['audit-logs', tenantId] as const,
  me: ['me'] as const
};

export const useDashboardOverview = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: apiClient.getDashboardOverview });
export const useTenants = (enabled = true) => useQuery({ queryKey: queryKeys.tenants, queryFn: apiClient.getTenants, enabled });
export const useUsers = (tenantId: string | null) => useQuery({ queryKey: queryKeys.users(tenantId ?? 'none'), queryFn: () => apiClient.getUsers(tenantId!), enabled: !!tenantId });
export const useUser = (tenantId: string | null, userId: string | undefined) => useQuery({ queryKey: queryKeys.user(tenantId ?? 'none', userId ?? 'none'), queryFn: () => apiClient.getUser(tenantId!, userId!), enabled: !!(tenantId && userId) });
export const useRoles = (tenantId: string | null) => useQuery({ queryKey: queryKeys.roles(tenantId ?? 'none'), queryFn: () => apiClient.getRoles(tenantId!), enabled: !!tenantId });
export const useFeatureFlags = (enabled = true) => useQuery({ queryKey: queryKeys.features, queryFn: apiClient.getFeatureFlags, enabled });
export const usePlans = () => useQuery({ queryKey: queryKeys.plans, queryFn: apiClient.getPlans });
export const useTenantSubscription = (tenantId: string | null) => useQuery({ queryKey: queryKeys.subscription(tenantId ?? 'none'), queryFn: () => apiClient.getTenantSubscription(tenantId!), enabled: !!tenantId });
export const useAuditLogs = (tenantId: string | null) => useQuery({ queryKey: queryKeys.auditLogs(tenantId ?? 'none'), queryFn: () => apiClient.getAuditLogs(tenantId!), enabled: !!tenantId });
export const useCurrentUser = (enabled = true) => useQuery({ queryKey: queryKeys.me, queryFn: apiClient.getCurrentUser, enabled });

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  return useMutation({
    mutationFn: apiClient.login,
    onSuccess: (session) => {
      setSession(session);
      navigate(getDefaultRoute(session.user.permissions, session.user.isPlatformAdmin), { replace: true });
    }
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const clearSession = useAppStore((state) => state.clearSession);
  return useMutation({
    mutationFn: apiClient.logout,
    onSettled: () => {
      clearSession();
      navigate('/login', { replace: true });
    }
  });
};

export const useCreateTenantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    }
  });
};

export const useSuspendTenantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.suspendTenant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants })
  });
};

export const useUpdateTenantPlanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, plan }: { tenantId: string; plan: PlanKey }) => apiClient.updateTenantPlan(tenantId, plan),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(variables.tenantId) });
    }
  });
};

export const useCreateUserMutation = (tenantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => apiClient.createUser(tenantId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users(tenantId) })
  });
};

export const useUpdateUserRolesMutation = (tenantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) => apiClient.updateUserRoles(tenantId, userId, roleIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users(tenantId) })
  });
};

export const useDisableUserMutation = (tenantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.disableUser(tenantId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users(tenantId) })
  });
};

export const useResetUserPasswordMutation = (tenantId: string) => useMutation({
  mutationFn: (userId: string) => apiClient.resetUserPassword(tenantId, userId)
});

export const useUpdateRoleMutation = (tenantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, ...payload }: { roleId: string; description?: string; permissionKeys: string[] }) => apiClient.updateRole(tenantId, roleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles(tenantId) })
  });
};

export const useUpdateFeatureFlagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: Partial<FeatureFlag> }) => apiClient.updateFeatureFlag(key, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.features })
  });
};