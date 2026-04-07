import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { PanelShell } from '@/components/feedback/status-badge';
import { cn } from '@/utils/cn';

interface DataTableProps<T> {
  columns: Array<ColumnDef<T>>;
  data: T[];
  className?: string;
}

export function DataTable<T>({ columns, data, className }: DataTableProps<T>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel()
  });

  const rows = table.getRowModel().rows;
  const headers = useMemo(() => table.getHeaderGroups(), [table]);

  return (
    <PanelShell className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            {headers.map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50/80 text-left text-xs uppercase tracking-[0.18em] text-muted">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border-b border-line px-4 py-3 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="text-sm text-slate-700 hover:bg-slate-50/80">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-line/80 px-4 py-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>
  );
}