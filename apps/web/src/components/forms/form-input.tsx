import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const FormInput = ({ label, hint, className, ...props }: FormInputProps) => (
  <label className="flex flex-col gap-2 text-sm text-slate-700">
    <span className="font-medium text-slate-900">{label}</span>
    <input
      className={cn('rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10', className)}
      {...props}
    />
    {hint ? <span className="text-xs text-muted">{hint}</span> : null}
  </label>
);