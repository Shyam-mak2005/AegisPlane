import { ArrowRight, Shield } from 'lucide-react';
import { PanelShell } from '@/components/feedback/status-badge';
import type { AuditLog } from '@/types/platform';

export const ActivityFeed = ({ items }: { items: AuditLog[] }) => (
  <PanelShell className="p-5">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Recent System Events</h3>
        <p className="mt-1 text-sm text-muted">Operational activity across authentication, access, and governance controls.</p>
      </div>
      <Shield className="h-5 w-5 text-cyan-700" />
    </div>
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item._id} className="flex items-start gap-3 border-b border-line/70 pb-4 last:border-none last:pb-0">
          <div className="mt-1 rounded-full bg-cyan-500/10 p-2 text-cyan-700">
            <ArrowRight className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{item.action}</p>
            <p className="mt-1 text-sm text-slate-600">{item.resourceType} · {new Date(item.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  </PanelShell>
);