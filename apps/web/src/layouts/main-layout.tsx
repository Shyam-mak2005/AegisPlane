import { Bell, ChevronLeft, ChevronRight, ChevronsUpDown, Flag, LayoutDashboard, LogOut, ReceiptText, ScrollText, Search, Settings, ShieldCheck, SlidersHorizontal, Users2, Waypoints, Building2 } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import type { NavItem } from '@/types/platform';
import { cn } from '@/utils/cn';
import { useAppStore } from '@/store/app-store';
import { useLogoutMutation } from '@/services/auth';
import { useFeatureFlags } from '@/services/features';
import { useTenants } from '@/services/tenants';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard', permission: 'system:read' },
  { label: 'Tenants', href: '/tenants', icon: 'tenants', permission: 'tenant:read', platformOnly: true },
  { label: 'Users', href: '/users', icon: 'users', permission: 'user:read' },
  { label: 'Roles & Permissions', href: '/roles', icon: 'roles', permission: 'role:read' },
  { label: 'Feature Flags', href: '/feature-flags', icon: 'features', permission: 'featureFlag:read', platformOnly: true },
  { label: 'Billing & Plans', href: '/billing', icon: 'billing', permission: 'billing:view' },
  { label: 'Audit Logs', href: '/audit-logs', icon: 'audit', permission: 'audit:read' },
  { label: 'System Metrics', href: '/system-metrics', icon: 'metrics', permission: 'system:read' },
  { label: 'Settings', href: '/settings', icon: 'settings' }
];

const iconMap = {
  dashboard: LayoutDashboard,
  tenants: Building2,
  users: Users2,
  roles: ShieldCheck,
  features: Flag,
  billing: ReceiptText,
  audit: ScrollText,
  metrics: Waypoints,
  settings: Settings
};

export const MainLayout = () => {
  const location = useLocation();
  const logoutMutation = useLogoutMutation();
  const { sidebarCollapsed, toggleSidebar, currentTenantId, setCurrentTenant, setFeatureFlags, user } = useAppStore();
  const tenantsQuery = useTenants(Boolean(user?.isPlatformAdmin));
  const featureFlagsQuery = useFeatureFlags(Boolean(user?.isPlatformAdmin));

  const tenantOptions = useMemo(() => {
    if (user?.isPlatformAdmin) {
      return tenantsQuery.data?.items ?? [];
    }

    return user?.tenantId
      ? [{ _id: user.tenantId, name: 'Tenant Scope', slug: 'tenant-scope', plan: 'enterprise', status: 'active', createdAt: new Date().toISOString(), activeUserCount: 0 }]
      : [];
  }, [tenantsQuery.data?.items, user?.isPlatformAdmin, user?.tenantId]);

  useEffect(() => {
    if (!currentTenantId && tenantOptions.length > 0) {
      setCurrentTenant(tenantOptions[0]._id);
    }
  }, [currentTenantId, setCurrentTenant, tenantOptions]);

  useEffect(() => {
    if (featureFlagsQuery.data) {
      setFeatureFlags(featureFlagsQuery.data.filter((flag) => flag.enabledByDefault).map((flag) => flag.key));
    }
  }, [featureFlagsQuery.data, setFeatureFlags]);

  const currentTenant = useMemo(() => tenantOptions.find((tenant) => tenant._id === currentTenantId) ?? tenantOptions[0], [currentTenantId, tenantOptions]);
  const visibleNavItems = useMemo(() => navItems.filter((item) => {
    if (item.platformOnly && !user?.isPlatformAdmin) {
      return false;
    }

    return !item.permission || user?.isPlatformAdmin || user?.permissions.includes(item.permission);
  }), [user]);

  return (
    <div className="flex min-h-screen">
      <aside className={cn('sticky top-0 flex h-screen flex-col border-r border-white/60 bg-slate-950 px-4 py-5 text-slate-100 transition-all duration-300', sidebarCollapsed ? 'w-[90px]' : 'w-[280px]')}>
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className={cn('transition-all', sidebarCollapsed && 'opacity-0')}>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">AegisPlane</p>
            <h1 className="mt-2 text-xl font-semibold">Control Plane</h1>
          </div>
          <button className="rounded-2xl border border-white/10 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white" onClick={toggleSidebar}>
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = location.pathname.startsWith(item.href);
            return (
              <NavLink key={item.href} to={item.href} className={cn('group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition', active ? 'bg-white text-slate-950 shadow-lg shadow-cyan-950/15' : 'text-slate-300 hover:bg-white/10 hover:text-white')}>
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed ? <span>{item.label}</span> : null}
              </NavLink>
            );
          })}
        </nav>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Current Scope</p>
          {!sidebarCollapsed ? (
            currentTenant ? (
              <>
                <p className="mt-2 text-base font-semibold text-white">{currentTenant.name}</p>
                <p className="mt-1 text-sm text-slate-300">{currentTenant.plan.toUpperCase()} plan / {currentTenant.activeUserCount} users</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-300">No tenant selected</p>
            )
          ) : null}
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-slate-100/90 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search tenants, users, roles, features" />
            </div>
            <div className="flex items-center gap-3">
              {tenantOptions.length > 0 ? (
                <div className="flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2 shadow-sm">
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                  <select className="bg-transparent text-sm font-medium text-slate-900 outline-none" value={currentTenant?._id ?? ''} onChange={(event) => setCurrentTenant(event.target.value)}>
                    {tenantOptions.map((tenant) => (
                      <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
                    ))}
                  </select>
                  <ChevronsUpDown className="h-4 w-4 text-slate-400" />
                </div>
              ) : null}
              <button className="rounded-2xl border border-white bg-white p-3 text-slate-600 shadow-sm transition hover:text-slate-900">
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-2.5 shadow-sm">
                <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">{user?.displayName.split(' ').map((part) => part[0]).join('')}</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user?.displayName}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
                <button className="rounded-xl border border-line px-3 py-2 text-sm text-slate-600 transition hover:text-slate-900" aria-label="Logout" onClick={() => logoutMutation.mutate()}>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};