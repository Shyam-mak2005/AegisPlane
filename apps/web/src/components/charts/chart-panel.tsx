import type { ReactNode } from 'react';
import { PanelShell } from '@/components/feedback/status-badge';

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const ChartPanel = ({ title, subtitle, action, children }: ChartPanelProps) => (
  <PanelShell className="p-5">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    <div className="h-72">{children}</div>
  </PanelShell>
);