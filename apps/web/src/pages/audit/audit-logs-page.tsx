import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-display/data-table';
import { ModalDialog } from '@/components/feedback/modal-dialog';
import { FormInput } from '@/components/forms/form-input';
import { PageHeader } from '@/components/layout/page-header';
import { useAuditLogs } from '@/services/audit';
import { useTenants } from '@/services/tenants';
import { useUsers } from '@/services/users';
import { useAppStore } from '@/store/app-store';
import type { AuditLog } from '@/types/platform';

export default function AuditLogsPage() {
  const currentTenantId = useAppStore((state) => state.currentTenantId);
  const user = useAppStore((state) => state.user);
  const { data } = useAuditLogs(currentTenantId);
  const { data: tenants } = useTenants(Boolean(user?.isPlatformAdmin));
  const { data: users } = useUsers(currentTenantId);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => (data?.items ?? []).filter((item) => `${item.action} ${item.resourceType}`.toLowerCase().includes(search.toLowerCase())), [data?.items, search]);

  const columns: ColumnDef<AuditLog>[] = [
    { header: 'Timestamp', cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
    { header: 'User', cell: ({ row }) => users?.items.find((entry) => entry._id === row.original.actorId)?.displayName ?? 'System' },
    { header: 'Tenant', cell: ({ row }) => user?.isPlatformAdmin ? (tenants?.items.find((tenant) => tenant._id === row.original.tenantId)?.name ?? 'Platform') : 'Current Tenant' },
    { header: 'Action', cell: ({ row }) => row.original.action },
    { header: 'Resource', cell: ({ row }) => `${row.original.resourceType}${row.original.resourceId ? `:${row.original.resourceId}` : ''}` },
    { header: 'Open', cell: ({ row }) => <button className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-slate-700" onClick={() => setSelected(row.original)}>Inspect</button> }
  ];

  return (
    <div>
      <PageHeader eyebrow="Compliance" title="Audit Log Explorer" description="Search tenant and user activity, inspect structured metadata, and trace sensitive operational changes across the control plane." />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <FormInput label="Tenant" value={currentTenantId ?? ''} readOnly />
        <FormInput label="User" placeholder="Current tenant scope" readOnly value="Tenant-scoped" />
        <FormInput label="Action" placeholder="Search action" value={search} onChange={(event) => setSearch(event.target.value)} />
        <FormInput label="Date Range" placeholder="Current window" value="Recent events" readOnly />
      </div>
      <DataTable columns={columns} data={rows} />
      <ModalDialog open={Boolean(selected)} title="Audit Event Detail" onClose={() => setSelected(null)}>
        {selected ? <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{JSON.stringify(selected, null, 2)}</pre> : null}
      </ModalDialog>
    </div>
  );
}