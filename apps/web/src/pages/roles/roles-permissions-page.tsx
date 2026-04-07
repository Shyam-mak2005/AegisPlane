import { useEffect, useMemo, useState } from 'react';
import { PermissionMatrix } from '@/components/data-display/permission-matrix';
import { PanelShell } from '@/components/feedback/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { usePermission } from '@/hooks/use-permission';
import { permissionCatalog } from '@/lib/permission-catalog';
import { useRoles, useUpdateRoleMutation } from '@/services/roles';
import { useAppStore } from '@/store/app-store';

export default function RolesPermissionsPage() {
  const currentTenantId = useAppStore((state) => state.currentTenantId);
  const { data } = useRoles(currentTenantId);
  const updateRoleMutation = useUpdateRoleMutation(currentTenantId ?? '');
  const canUpdateRoles = usePermission('role:update');
  const [activeRoleId, setActiveRoleId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const activeRole = useMemo(() => data?.find((role) => role._id === activeRoleId) ?? data?.[0], [activeRoleId, data]);

  useEffect(() => {
    if (activeRole?._id) {
      setActiveRoleId(activeRole._id);
      setSelectedPermissions(activeRole.permissionKeys);
    }
  }, [activeRole?._id]);

  const resourcePermissions = [
    { resource: 'Users', create: selectedPermissions.includes('user:create'), read: selectedPermissions.includes('user:read'), update: selectedPermissions.includes('user:update'), delete: selectedPermissions.includes('user:disable') },
    { resource: 'Billing', create: false, read: selectedPermissions.includes('billing:view'), update: selectedPermissions.includes('billing:manage'), delete: false },
    { resource: 'Audit Logs', create: false, read: selectedPermissions.includes('audit:read'), update: false, delete: false },
    { resource: 'Feature Flags', create: false, read: selectedPermissions.includes('featureFlag:read'), update: selectedPermissions.includes('featureFlag:update'), delete: false }
  ];

  return (
    <div>
      <PageHeader eyebrow="Access Control" title="Roles & Permissions" description="Define granular control-plane privileges and update tenant roles with explicit permission composition." />
      {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Roles</h3>
          <div className="mt-4 space-y-3">
            {(data ?? []).map((role) => (
              <button key={role._id} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeRole?._id === role._id ? 'border-cyan-500 bg-cyan-50' : 'border-line bg-white'}`} onClick={() => { setActiveRoleId(role._id); setSelectedPermissions(role.permissionKeys); }}>
                <p className="font-medium text-slate-950">{role.name}</p>
                <p className="mt-1 text-sm text-muted">{role.description}</p>
              </button>
            ))}
          </div>
        </PanelShell>
        <div className="space-y-6">
          <PermissionMatrix resourcePermissions={resourcePermissions} />
          <PanelShell className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-950">Permission Toggles</h3>
              {activeRole && canUpdateRoles ? <button className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white" onClick={() => updateRoleMutation.mutate({ roleId: activeRole._id, description: activeRole.description, permissionKeys: selectedPermissions }, { onSuccess: () => setMessage(`${activeRole.name} updated.`) })}>Save Role</button> : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {permissionCatalog.map((permission) => (
                <label key={permission} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 text-sm text-slate-700">
                  <span>{permission}</span>
                  <input type="checkbox" checked={selectedPermissions.includes(permission)} disabled={!canUpdateRoles} onChange={(event) => setSelectedPermissions((current) => event.target.checked ? [...new Set([...current, permission])] : current.filter((item) => item !== permission))} className="h-4 w-4 accent-cyan-700" />
                </label>
              ))}
            </div>
          </PanelShell>
        </div>
      </div>
    </div>
  );
}