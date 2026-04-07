import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-display/data-table';
import { ModalDialog } from '@/components/feedback/modal-dialog';
import { StatusBadge } from '@/components/feedback/status-badge';
import { FormInput } from '@/components/forms/form-input';
import { PageHeader } from '@/components/layout/page-header';
import { usePermission } from '@/hooks/use-permission';
import { ApiClientError } from '@/services/auth';
import { useCreateTenantMutation, useSuspendTenantMutation, useTenants, useUpdateTenantPlanMutation } from '@/services/tenants';
import { useAppStore } from '@/store/app-store';
import type { PlanKey, Tenant } from '@/types/platform';

const planProgression: Record<PlanKey, PlanKey> = {
  free: 'pro',
  pro: 'enterprise',
  enterprise: 'enterprise'
};

export default function TenantsPage() {
  const user = useAppStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useTenants();
  const canCreateTenant = Boolean(user?.isPlatformAdmin) && usePermission('tenant:create');
  const canSuspendTenant = Boolean(user?.isPlatformAdmin) && usePermission('tenant:update');
  const canUpdatePlan = Boolean(user?.isPlatformAdmin) && usePermission('subscription:update');
  const createTenantMutation = useCreateTenantMutation();
  const suspendMutation = useSuspendTenantMutation();
  const updatePlanMutation = useUpdateTenantPlanMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    slug: '',
    plan: 'free' as PlanKey,
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const tenants = data?.items ?? [];
  const createError = createTenantMutation.error instanceof ApiClientError ? createTenantMutation.error.message : null;
  const fetchError = error instanceof ApiClientError ? error.message : null;

  useEffect(() => {
    console.log('Fetched tenants:', data);
    console.log("TENANTS STATE:", tenants);
    console.log("USER IS PLATFORM ADMIN:", user?.isPlatformAdmin);
    console.log("TENANTS LENGTH:", tenants.length);
    console.log("IS LOADING:", isLoading);
    console.log("FETCH ERROR:", fetchError);
  }, [data, tenants, user?.isPlatformAdmin, isLoading, fetchError]);

  const columns: ColumnDef<Tenant>[] = useMemo(() => [
    {
      header: 'Tenant Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-950">{row.original.name}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{row.original.slug}</p>
        </div>
      )
    },
    { header: 'Plan', cell: ({ row }) => <span className="font-medium uppercase text-slate-700">{row.original.plan}</span> },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Created Date', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    { header: 'Active Users', cell: ({ row }) => row.original.activeUserCount },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-cyan-600 hover:text-cyan-700" to={`/tenants/${row.original._id}`}>View Tenant</Link>
          {canSuspendTenant ? <button className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700" onClick={() => {
            if (!window.confirm(`Suspend ${row.original.name}?`)) return;
            suspendMutation.mutate(row.original._id, { onSuccess: () => {
              setMessage(`${row.original.name} suspended.`);
              queryClient.invalidateQueries({ queryKey: ['tenants'] });
            } });
          }}>Suspend Tenant</button> : null}
          {canUpdatePlan ? <button className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700" onClick={() => {
            const plan = planProgression[row.original.plan];
            updatePlanMutation.mutate({ tenantId: row.original._id, plan }, { onSuccess: () => {
              setMessage(`${row.original.name} moved to ${plan}.`);
              queryClient.invalidateQueries({ queryKey: ['tenants'] });
            } });
          }}>{row.original.plan === 'enterprise' ? 'Enterprise Plan' : 'Upgrade Plan'}</button> : null}
        </div>
      )
    }
  ], [canSuspendTenant, canUpdatePlan, suspendMutation, updatePlanMutation]);

  return (
    <div>
      <PageHeader eyebrow="Tenancy" title="Tenant Management" description="Manage organizations, plan tiering, and tenant lifecycle controls with explicit platform-only access boundaries." />
      {canCreateTenant ? (
        <div className="mb-4 flex justify-end">
          <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white" onClick={() => {
            createTenantMutation.reset();
            setIsCreateOpen(true);
          }}>
            Create Tenant
          </button>
        </div>
      ) : null}
      {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {isLoading ? <div className="mb-4 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-muted">Loading tenants...</div> : null}
      {fetchError ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{fetchError}</div> : null}
      {!isLoading && !fetchError && tenants.length === 0 ? <div className="mb-4 rounded-2xl border border-line bg-white px-4 py-6 text-sm text-muted">No tenants found yet. Create a tenant to see it appear here immediately.</div> : null}
      {tenants.length > 0 ? <DataTable columns={columns} data={tenants} /> : null}
      <ModalDialog open={isCreateOpen} title="Create Tenant" onClose={() => setIsCreateOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => {
          event.preventDefault();
          createTenantMutation.mutate(formState, {
            onSuccess: (tenant) => {
              console.log('Created tenant:', tenant);
              setMessage(`${tenant.name} created successfully and added to the tenant list.`);
              setIsCreateOpen(false);
              createTenantMutation.reset();
              setFormState({
                name: '',
                slug: '',
                plan: 'free',
                adminName: '',
                adminEmail: '',
                adminPassword: ''
              });
              queryClient.invalidateQueries({ queryKey: ['tenants'] });
            }
          });
        }}>
          <FormInput label="Tenant Name" value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} required />
          <FormInput label="Slug" value={formState.slug} onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} required />
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Plan</span>
            <select className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none" value={formState.plan} onChange={(event) => setFormState((current) => ({ ...current, plan: event.target.value as PlanKey }))}>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>
          <FormInput label="Admin Name" value={formState.adminName} onChange={(event) => setFormState((current) => ({ ...current, adminName: event.target.value }))} required />
          <FormInput label="Admin Email" type="email" value={formState.adminEmail} onChange={(event) => setFormState((current) => ({ ...current, adminEmail: event.target.value }))} required />
          <FormInput label="Admin Password" type="password" value={formState.adminPassword} onChange={(event) => setFormState((current) => ({ ...current, adminPassword: event.target.value }))} required hint="Must be at least 12 characters." />
          {createError ? <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div> : null}
          <div className="md:col-span-2 flex justify-end">
            <button disabled={createTenantMutation.isPending} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
              {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}