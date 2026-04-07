import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PanelShell } from '@/components/feedback/status-badge';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning';
  icon?: ReactNode;
}

export const MetricCard = ({ label, value, change, tone = 'neutral', icon }: MetricCardProps) => {
  const toneMap = {
    neutral: 'from-slate-900 to-slate-700',
    accent: 'from-cyan-700 to-teal-600',
    success: 'from-emerald-700 to-emerald-600',
    warning: 'from-amber-600 to-orange-500'
  } satisfies Record<typeof tone, string>;

  return (
    <PanelShell className="overflow-hidden">
      <div className="flex items-start justify-between px-5 py-5">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600">
            <ArrowUpRight className="h-4 w-4" />
            {change}
          </p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${toneMap[tone]} p-3 text-white`}>
          {icon}
        </div>
      </div>
    </PanelShell>
  );
};