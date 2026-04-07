import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActivityFeed } from '@/components/data-display/activity-feed';
import { PermissionMatrix } from '@/components/data-display/permission-matrix';
import { PanelShell, StatusBadge } from '@/components/feedback/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { useAuditLogs } from '@/services/audit';
import { useFeatureFlags } from '@/services/features';
import { useRoles } from '@/services/roles';
import { useTenants } from '@/services/tenants';
import { useUsers } from '@/services/users';
import { useAppStore } from '@/store/app-store';

const tabs = ['Overview', 'Users', 'Roles', 'Features', 'Usage Metrics', 'Audit Logs'] as const;

export default function TenantDetailsPage() {
  const { tenantId } = useParams();
  const setCurrentTenant = useAppStore((state) => state.setCurrentTenant);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Overview');
  const { data: tenants } = useTenants();
  const { data: users } = useUsers(tenantId ?? null);
  const { data: roles } = useRoles(tenantId ?? null);
  const { data: featureFlags } = useFeatureFlags();
  const { data: auditLogs } = useAuditLogs(tenantId ?? null);

  useEffect(() => {
    if (tenantId) {
      setCurrentTenant(tenantId);
    }
  }, [setCurrentTenant, tenantId]);

  const tenant = useMemo(() => tenants?.items.find((item) => item._id === tenantId), [tenantId, tenants?.items]);
  const roleMatrix = useMemo(() => {
    const permissions = new Set(roles?.flatMap((role) => role.permissionKeys) ?? []);
    return [
      { resource: 'Users', create: permissions.has('user:create'), read: permissions.has('user:read'), update: permissions.has('user:update'), delete: permissions.has('user:disable') },
      { resource: 'Billing', create: false, read: permissions.has('billing:view'), update: permissions.has('billing:manage'), delete: false },
      { resource: 'Audit Logs', create: false, read: permissions.has('audit:read'), update: false, delete: false },
      { resource: 'Feature Flags', create: false, read: permissions.has('featureFlag:read'), update: permissions.has('featureFlag:update'), delete: false }
    ];
  }, [roles]);

  if (!tenant) {
    return <div className="rounded-panel border border-line bg-white px-5 py-10 text-sm text-muted shadow-panel">Tenant not found or no longer accessible.</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Tenant Detail" title={tenant.name} description="Inspect tenant posture, role assignment, feature rollout, usage, and audit trail from a single operational view." />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${activeTab === tab ? 'bg-slate-950 text-white' : 'border border-line bg-white text-slate-700'}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PanelShell className="p-5">
          {activeTab === 'Overview' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Tenant Plan</p><p className="mt-2 text-2xl font-semibold uppercase text-slate-950">{tenant.plan}</p></div>
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Tenant Status</p><div className="mt-3"><StatusBadge status={tenant.status} /></div></div>
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Active Users</p><p className="mt-2 text-2xl font-semibold text-slate-950">{tenant.activeUserCount}</p></div>
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Created</p><p className="mt-2 text-2xl font-semibold text-slate-950">{new Date(tenant.createdAt).toLocaleDateString()}</p></div>
            </div>
          ) : null}
          {activeTab === 'Users' ? (
            <div className="space-y-3">
              {(users?.items ?? []).map((user) => (
                <div key={user._id} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                  <div><p className="font-medium text-slate-950">{user.displayName}</p><p className="text-sm text-muted">{user.email}</p></div>
                  <StatusBadge status={user.status} />
                </div>
              ))}
            </div>
          ) : null}
          {activeTab === 'Roles' ? <PermissionMatrix resourcePermissions={roleMatrix} /> : null}
          {activeTab === 'Features' ? (
            <div className="space-y-3">
              {(featureFlags ?? []).map((flag) => (
                <div key={flag.key} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                  <div><p className="font-medium text-slate-950">{flag.key}</p><p className="text-sm text-muted">{flag.description}</p></div>
                  <StatusBadge status={flag.enabledByDefault ? 'active' : 'disabled'} />
                </div>
              ))}
            </div>
          ) : null}
          {activeTab === 'Usage Metrics' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Provisioned Seats</p><p className="mt-2 text-2xl font-semibold text-slate-950">{tenant.activeUserCount}</p></div>
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Audit Events</p><p className="mt-2 text-2xl font-semibold text-slate-950">{auditLogs?.items.length ?? 0}</p></div>
              <div className="rounded-3xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Feature Flags</p><p className="mt-2 text-2xl font-semibold text-slate-950">{featureFlags?.length ?? 0}</p></div>
            </div>
          ) : null}
          {activeTab === 'Audit Logs' ? <ActivityFeed items={auditLogs?.items ?? []} /> : null}
        </PanelShell>
        <div className="space-y-6">
          <PanelShell className="p-5">
            <h3 className="text-lg font-semibold text-slate-950">Assigned Roles</h3>
            <div className="mt-4 space-y-3">
              {(roles ?? []).map((role) => (
                <div key={role._id} className="rounded-2xl border border-line px-4 py-3"><p className="font-medium text-slate-950">{role.name}</p><p className="mt-1 text-sm text-muted">{role.description}</p></div>
              ))}
            </div>
          </PanelShell>
          <PanelShell className="p-5">
            <h3 className="text-lg font-semibold text-slate-950">Control Notes</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">All tenant-scoped queries and mutations are executed with the selected tenant ID header, while the backend independently enforces tenant boundaries before any state mutation occurs.</p>
          </PanelShell>
        </div>
      </div>
    </div>
  );
}