import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/main-layout';
import { apiClient } from '@/services/auth';
import { useAppStore } from '@/store/app-store';
import type { AuthUser } from '@/types/platform';

const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page'));
const TenantsPage = lazy(() => import('@/pages/tenants/tenants-page'));
const TenantDetailsPage = lazy(() => import('@/pages/tenants/tenant-details-page'));
const UsersPage = lazy(() => import('@/pages/users/users-page'));
const UserProfilePage = lazy(() => import('@/pages/users/user-profile-page'));
const RolesPermissionsPage = lazy(() => import('@/pages/roles/roles-permissions-page'));
const FeatureFlagsPage = lazy(() => import('@/pages/feature-flags/feature-flags-page'));
const BillingPlansPage = lazy(() => import('@/pages/billing/billing-page'));
const AuditLogsPage = lazy(() => import('@/pages/audit/audit-logs-page'));
const SystemMetricsPage = lazy(() => import('@/pages/system/system-metrics-page'));
const SettingsPage = lazy(() => import('@/pages/settings/settings-page'));

const RouteLoader = ({ label = 'Loading control-plane module...' }: { label?: string }) => <div className="rounded-panel border border-line bg-white px-4 py-10 text-center text-sm text-muted shadow-panel">{label}</div>;
const UnauthorizedPanel = () => <div className="rounded-panel border border-amber-200 bg-amber-50 px-5 py-10 text-sm text-amber-800 shadow-panel">You do not have permission to access this area.</div>;

const getLandingRoute = (user: AuthUser) => {
  if (user.isPlatformAdmin || user.permissions.includes('system:read')) return '/dashboard';
  if (user.permissions.includes('user:read')) return '/users';
  if (user.permissions.includes('audit:read')) return '/audit-logs';
  if (user.permissions.includes('billing:view')) return '/billing';
  return '/settings';
};

const PermissionRoute = ({ permission }: { permission: string }) => {
  const user = useAppStore((state) => state.user);
  if (user?.isPlatformAdmin || user?.permissions.includes(permission)) {
    return <Outlet />;
  }
  return <UnauthorizedPanel />;
};

const PlatformRoute = () => {
  const user = useAppStore((state) => state.user);
  return user?.isPlatformAdmin ? <Outlet /> : <UnauthorizedPanel />;
};

const ProtectedRoute = () => {
  const user = useAppStore((state) => state.user);
  const accessToken = useAppStore((state) => state.accessToken);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);
  const [checking, setChecking] = useState(!user || !accessToken);

  useEffect(() => {
    let active = true;

    if (user && accessToken) {
      setChecking(false);
      return () => {
        active = false;
      };
    }

    apiClient.refreshSession()
      .then((session) => {
        if (!active) return;
        setSession(session);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
      })
      .finally(() => {
        if (active) {
          setChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, clearSession, setSession, user]);

  if (checking) {
    return <RouteLoader label="Restoring secure session..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const user = useAppStore((state) => state.user);
  return user ? <Navigate to={getLandingRoute(user)} replace /> : <LoginPage />;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<PermissionRoute permission="system:read" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/system-metrics" element={<SystemMetricsPage />} />
            </Route>
            <Route element={<PlatformRoute />}>
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/tenants/:tenantId" element={<TenantDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="user:read" />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:userId" element={<UserProfilePage />} />
            </Route>
            <Route element={<PermissionRoute permission="role:read" />}>
              <Route path="/roles" element={<RolesPermissionsPage />} />
            </Route>
            <Route element={<PlatformRoute />}>
              <Route path="/feature-flags" element={<FeatureFlagsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="billing:view" />}>
              <Route path="/billing" element={<BillingPlansPage />} />
            </Route>
            <Route element={<PermissionRoute permission="audit:read" />}>
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);