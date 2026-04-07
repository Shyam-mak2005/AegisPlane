import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-display/data-table';
import { ModalDialog } from '@/components/feedback/modal-dialog';
import { StatusBadge } from '@/components/feedback/status-badge';
import { FormInput } from '@/components/forms/form-input';
import { PageHeader } from '@/components/layout/page-header';
import { usePermission } from '@/hooks/use-permission';
import { useRoles } from '@/services/roles';
import { useCreateUserMutation, useDisableUserMutation, useResetUserPasswordMutation, useUpdateUserRolesMutation, useUsers } from '@/services/users';
import { useAppStore } from '@/store/app-store';
import type { User } from '@/types/platform';

export default function UsersPage() {
  const currentTenantId = useAppStore((state) => state.currentTenantId);
  const { data } = useUsers(currentTenantId);
  const { data: roles } = useRoles(currentTenantId);
  const canCreateUsers = usePermission('user:create');
  const canUpdateUsers = usePermission('user:update');
  const canDisableUsers = usePermission('user:disable');
  const createUserMutation = useCreateUserMutation(currentTenantId ?? '');
  const updateRolesMutation = useUpdateUserRolesMutation(currentTenantId ?? '');
  const disableUserMutation = useDisableUserMutation(currentTenantId ?? '');
  const resetPasswordMutation = useResetUserPasswordMutation(currentTenantId ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formState, setFormState] = useState({
    displayName: '',
    email: '',
    roleId: ''
  });
  const availableRoles = (roles ?? []).filter((role) => role.scope === 'tenant');

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-950">{row.original.displayName}</p>
          <p className="text-sm text-muted">{row.original.email}</p>
        </div>
      )
    },
    { header: 'Email', cell: ({ row }) => row.original.email },
    { header: 'Role', cell: ({ row }) => row.original.roleIds.map((role) => role.name).join(', ') },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Last Login', cell: ({ row }) => row.original.lastLoginAt ? new Date(row.original.lastLoginAt).toLocaleString() : 'Never' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-slate-700" to={`/users/${row.original._id}`}>Profile</Link>
          {canUpdateUsers ? <button className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700" onClick={() => {
            const nextRole = availableRoles.find((role) => !row.original.roleIds.some((assigned) => assigned._id === role._id)) ?? availableRoles[0];
            if (!nextRole) return;
            updateRolesMutation.mutate({ userId: row.original._id, roleIds: [nextRole._id] }, { onSuccess: () => setMessage(`${row.original.displayName} now uses ${nextRole.name}.`) });
          }}>Change Role</button> : null}
          {canDisableUsers ? <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" onClick={() => disableUserMutation.mutate(row.original._id, { onSuccess: () => setMessage(`${row.original.displayName} disabled.`) })}>Disable Account</button> : null}
          {canUpdateUsers ? <button className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700" onClick={() => resetPasswordMutation.mutate(row.original._id, { onSuccess: (result) => setMessage(`Temporary password for ${row.original.displayName}: ${result.temporaryPassword}`) })}>Reset Password</button> : null}
        </div>
      )
    }
  ], [availableRoles, canDisableUsers, canUpdateUsers, disableUserMutation, resetPasswordMutation, updateRolesMutation]);

  return (
    <div>
      <PageHeader eyebrow="Identity" title="User Management" description="Operate on tenant-scoped accounts, role assignments, and access posture while keeping changes auditable." />
      {canCreateUsers && currentTenantId ? (
        <div className="mb-4 flex justify-end">
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white" onClick={() => setIsCreateOpen(true)}>
            Invite User
          </button>
        </div>
      ) : null}
      {message ? <div className="mb-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">{message}</div> : null}
      <DataTable columns={columns} data={data?.items ?? []} />
      <ModalDialog open={isCreateOpen} title="Invite User" onClose={() => setIsCreateOpen(false)}>
        <form className="grid gap-4" onSubmit={(event) => {
          event.preventDefault();
          if (!currentTenantId || !formState.roleId) return;

          createUserMutation.mutate({
            displayName: formState.displayName,
            email: formState.email,
            roleIds: [formState.roleId]
          }, {
            onSuccess: (result) => {
              setMessage(`Invited ${result.user.displayName}. Temporary password: ${result.temporaryPassword}`);
              setIsCreateOpen(false);
              setFormState({
                displayName: '',
                email: '',
                roleId: ''
              });
            }
          });
        }}>
          <FormInput label="Display Name" value={formState.displayName} onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))} required />
          <FormInput label="Email" type="email" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} required />
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Role</span>
            <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none" value={formState.roleId} onChange={(event) => setFormState((current) => ({ ...current, roleId: event.target.value }))} required>
              <option value="">Select a role</option>
              {availableRoles.map((role) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-end">
            <button disabled={createUserMutation.isPending} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
              {createUserMutation.isPending ? 'Inviting...' : 'Invite User'}
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}