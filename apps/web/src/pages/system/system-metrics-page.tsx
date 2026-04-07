import { PageHeader } from '@/components/layout/page-header';
import { PanelShell, StatusBadge } from '@/components/feedback/status-badge';

export default function SystemMetricsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Platform Runtime"
        title="System Metrics"
        description="Track service readiness, queue health, and execution capacity across the control-plane runtime."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Core Services</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-3"><span>API</span><StatusBadge status="healthy" /></div>
            <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-3"><span>MongoDB</span><StatusBadge status="healthy" /></div>
            <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-3"><span>Redis</span><StatusBadge status="healthy" /></div>
          </div>
        </PanelShell>
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Queue Throughput</h3>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Email Queue</p><p className="mt-2 text-2xl font-semibold text-slate-950">184 jobs/min</p></div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Audit Queue</p><p className="mt-2 text-2xl font-semibold text-slate-950">630 jobs/min</p></div>
          </div>
        </PanelShell>
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Capacity Signals</h3>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">CPU Saturation</p><p className="mt-2 text-2xl font-semibold text-slate-950">41%</p></div>
            <div className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm text-muted">Memory Footprint</p><p className="mt-2 text-2xl font-semibold text-slate-950">3.2 GB</p></div>
          </div>
        </PanelShell>
      </div>
    </div>
  );
}