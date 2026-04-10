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

// FIX 1: Robust URL handling. 
// Use VITE_API_URL as discussed for Vercel. Remove trailing slash to prevent "//api/v1"
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

// FIX 2: Prevent "Refresh Token Race Condition"
// If 5 requests fail with 401 at the same time, only 1 should call the refresh endpoint.
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
    credentials: 'include' // Required for HTTP-only Refresh Cookies
  });

  // FIX 3: Improved Refresh Logic
  if (response.status === 401 && !skipAuth && retryOn401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = request<AuthSession>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
        skipAuth: true,
        retryOn401: false
      }).finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    try {
      const session = await refreshPromise!;
      setSession(session);
      // Retry the original request with the new token
      return request<T>(path, { ...options, retryOn401: false });
    } catch {
      clearSession();
      throw new ApiClientError(401, { code: 'SESSION_EXPIRED', message: 'Your session has expired. Please log in again.' });
    }
  }

  return parsePayload<T>(response);
};

export const apiClient = {
  // ... (rest of your apiClient methods remain the same)
  login: (payload: { email: string; password: string; tenantSlug?: string }) => request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
    retryOn401: false
  }),
  // ... rest of the file
};

// ... (Rest of your Hooks/Queries remain the same)