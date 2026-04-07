import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div>
      {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
    {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
  </div>
);