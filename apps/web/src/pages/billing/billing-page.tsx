import { PageHeader } from '@/components/layout/page-header';
import { usePermission } from '@/hooks/use-permission';
import { PanelShell, StatusBadge } from '@/components/feedback/status-badge';
import { usePlans, useTenantSubscription, useUpdateTenantPlanMutation } from '@/services/billing';
import { useTenants } from '@/services/tenants';
import { useAppStore } from '@/store/app-store';

export default function BillingPlansPage() {
  const currentTenantId = useAppStore((state) => state.currentTenantId);
  const user = useAppStore((state) => state.user);
  const { data: plans } = usePlans();
  const { data: tenants } = useTenants(Boolean(user?.isPlatformAdmin));
  const { data: subscription } = useTenantSubscription(currentTenantId);
  const updatePlanMutation = useUpdateTenantPlanMutation();
  const canUpdateSubscription = Boolean(user?.isPlatformAdmin) && usePermission('subscription:update');
  const tenant = user?.isPlatformAdmin ? tenants?.items.find((item) => item._id === currentTenantId) : undefined;

  return (
    <div>
      <PageHeader eyebrow="Commercial Controls" title="Billing & Plans" description="Review commercial packaging, plan entitlements, and current tenant consumption against platform-defined limits." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-3">
          {(plans ?? []).map((plan) => (
            <PanelShell key={plan.key} className={`p-5 ${subscription?.plan === plan.key ? 'border-cyan-500' : ''}`}>
              <div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-slate-950">{plan.label}</h3>{subscription?.plan === plan.key ? <StatusBadge status="active" /> : null}</div>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <p><span className="font-medium text-slate-950">Max users:</span> {plan.maxUsers}</p>
                <p><span className="font-medium text-slate-950">API rate limit:</span> {plan.apiRateLimitPerMinute}/min</p>
                <p><span className="font-medium text-slate-950">Features:</span> {plan.features.join(', ')}</p>
              </div>
              <button disabled={!canUpdateSubscription || updatePlanMutation.isPending} className="mt-5 w-full rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => currentTenantId && updatePlanMutation.mutate({ tenantId: currentTenantId, plan: plan.key })}>{subscription?.plan === plan.key ? 'Current Plan' : canUpdateSubscription ? 'Upgrade Plan' : 'Read Only'}</button>
            </PanelShell>
          ))}
        </div>
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Tenant Billing Snapshot</h3>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Current Plan</p><p className="mt-2 text-2xl font-semibold uppercase text-slate-950">{subscription?.plan ?? tenant?.plan ?? 'n/a'}</p></div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Usage Statistics</p><p className="mt-2 text-slate-700">{subscription?.usageSnapshot.users ?? tenant?.activeUserCount ?? 0} active users / {subscription?.usageSnapshot.apiRequestsToday ?? 0} requests today</p></div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Subscription Status</p><p className="mt-2 text-slate-700">{subscription?.status ?? 'unknown'} / {subscription?.billingCycle ?? 'n/a'} billing</p></div>
          </div>
          {!canUpdateSubscription ? <p className="mt-4 text-sm text-muted">Plan changes are restricted to platform administrators with subscription update rights.</p> : null}
        </PanelShell>
      </div>
    </div>
  );
}