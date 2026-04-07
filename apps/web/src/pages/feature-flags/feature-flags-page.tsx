import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-display/data-table';
import { StatusBadge } from '@/components/feedback/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { usePermission } from '@/hooks/use-permission';
import { useFeatureFlags, useUpdateFeatureFlagMutation } from '@/services/features';
import type { FeatureFlag } from '@/types/platform';

export default function FeatureFlagsPage() {
  const { data } = useFeatureFlags();
  const updateFeatureFlagMutation = useUpdateFeatureFlagMutation();
  const canUpdateFlags = usePermission('featureFlag:update');

  const columns: ColumnDef<FeatureFlag>[] = [
    { header: 'Feature Name', cell: ({ row }) => <span className="font-medium text-slate-950">{row.original.key}</span> },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.enabledByDefault ? 'active' : 'disabled'} /> },
    { header: 'Tenants Enabled', cell: ({ row }) => row.original.tenantOverrides?.filter((item) => item.enabled).length ?? 'Plan-based' },
    { header: 'Rollout %', cell: ({ row }) => `${row.original.rolloutPercentage}%` },
    {
      header: 'Controls',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
            <input type="checkbox" checked={row.original.enabledByDefault} disabled={!canUpdateFlags} onChange={(event) => updateFeatureFlagMutation.mutate({ key: row.original.key, payload: { enabledByDefault: event.target.checked } })} className="h-4 w-4 accent-cyan-700" />
            Toggle
          </label>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader eyebrow="Release Controls" title="Feature Flags" description="Manage plan-aware capabilities, rollout percentages, and tenant-specific overrides without compromising platform consistency." />
      {!canUpdateFlags ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Feature flags are view-only for your current role.</div> : null}
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
}