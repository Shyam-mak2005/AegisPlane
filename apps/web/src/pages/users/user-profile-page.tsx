import { ActivityFeed } from '@/components/data-display/activity-feed';
import { PanelShell, StatusBadge } from '@/components/feedback/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { useAuditLogs } from '@/services/audit';
import { useUser } from '@/services/users';
import { useAppStore } from '@/store/app-store';
import { useParams } from 'react-router-dom';

export default function UserProfilePage() {
  const { userId } = useParams();
  const currentTenantId = useAppStore((state) => state.currentTenantId);
  const { data: user } = useUser(currentTenantId, userId);
  const { data: auditLogs } = useAuditLogs(currentTenantId);

  if (!user) {
    return <div className="rounded-panel border border-line bg-white px-5 py-10 text-sm text-muted shadow-panel">User not found.</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Identity Detail" title={user.displayName} description="Inspect identity metadata, assigned roles, effective permissions, and recent activity for this account." />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelShell className="p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted">User Status</p><div className="mt-3"><StatusBadge status={user.status} /></div></div>
            <div className="rounded-3xl bg-slate-950 px-4 py-3 text-lg font-semibold text-white">{user.displayName.split(' ').map((part) => part[0]).join('')}</div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-muted">Email</dt><dd className="mt-1 font-medium text-slate-950">{user.email}</dd></div>
            <div><dt className="text-sm text-muted">Last Login</dt><dd className="mt-1 font-medium text-slate-950">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</dd></div>
            <div><dt className="text-sm text-muted">Assigned Roles</dt><dd className="mt-1 font-medium text-slate-950">{user.roleIds.map((role) => role.name).join(', ')}</dd></div>
            <div><dt className="text-sm text-muted">Tenant</dt><dd className="mt-1 font-medium text-slate-950">{user.tenantId}</dd></div>
          </dl>
        </PanelShell>
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Effective Permissions</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.roleIds.flatMap((role) => role.permissionKeys).map((permission) => (
              <span key={permission} className="rounded-full border border-line bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">{permission}</span>
            ))}
          </div>
        </PanelShell>
      </div>
      <div className="mt-6">
        <ActivityFeed items={(auditLogs?.items ?? []).filter((item) => item.actorId === user._id)} />
      </div>
    </div>
  );
}