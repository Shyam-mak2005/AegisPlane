import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const toneMap: Record<string, string> = {
  active: 'bg-emerald-500/12 text-emerald-700 ring-emerald-600/20',
  healthy: 'bg-emerald-500/12 text-emerald-700 ring-emerald-600/20',
  invited: 'bg-sky-500/12 text-sky-700 ring-sky-600/20',
  suspended: 'bg-amber-500/12 text-amber-700 ring-amber-600/20',
  warning: 'bg-amber-500/12 text-amber-700 ring-amber-600/20',
  disabled: 'bg-rose-500/12 text-rose-700 ring-rose-600/20',
  critical: 'bg-rose-500/12 text-rose-700 ring-rose-600/20',
  trialing: 'bg-violet-500/12 text-violet-700 ring-violet-600/20'
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset', toneMap[status] ?? 'bg-slate-200 text-slate-700 ring-slate-300', className)}>
    {status.replace('_', ' ')}
  </span>
);

export const PanelShell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('rounded-panel border border-line/70 bg-white/90 shadow-panel backdrop-blur-sm', className)}>{children}</div>
);