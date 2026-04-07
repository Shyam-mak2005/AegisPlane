import { Check, Minus } from 'lucide-react';
import { PanelShell } from '@/components/feedback/status-badge';
import { cn } from '@/utils/cn';

interface PermissionMatrixProps {
  resourcePermissions: Array<{
    resource: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }>;
}

export const PermissionMatrix = ({ resourcePermissions }: PermissionMatrixProps) => (
  <PanelShell className="overflow-hidden">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-muted">
        <tr>
          <th className="border-b border-line px-4 py-3 font-medium">Resource</th>
          <th className="border-b border-line px-4 py-3 font-medium">Create</th>
          <th className="border-b border-line px-4 py-3 font-medium">Read</th>
          <th className="border-b border-line px-4 py-3 font-medium">Update</th>
          <th className="border-b border-line px-4 py-3 font-medium">Delete</th>
        </tr>
      </thead>
      <tbody>
        {resourcePermissions.map((item) => (
          <tr key={item.resource} className="border-b border-line/70 text-slate-700">
            <td className="px-4 py-3 font-medium text-slate-900">{item.resource}</td>
            {(['create', 'read', 'update', 'delete'] as const).map((key) => (
              <td key={key} className="px-4 py-3">
                <span className={cn('inline-flex rounded-full p-1.5', item[key] ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-200 text-slate-500')}>
                  {item[key] ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </PanelShell>
);