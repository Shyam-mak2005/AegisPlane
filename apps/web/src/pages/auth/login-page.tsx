import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { FormInput } from '@/components/forms/form-input';
import { ApiClientError, useLoginMutation } from '@/services/auth';

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('admin@aegisplane.dev');
  const [password, setPassword] = useState('ChangeMeNow123!');
  const [tenantSlug, setTenantSlug] = useState('');

  const error = loginMutation.error instanceof ApiClientError ? loginMutation.error.message : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-panel lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-slate-950 px-8 py-10 text-white">
          <div className="inline-flex rounded-3xl bg-cyan-500/10 p-3 text-cyan-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.35em] text-cyan-300/80">AegisPlane</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Secure control-plane access</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Authenticate into the multi-tenant governance platform with revocable sessions, scoped tenant access, and audited administrative actions.</p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
            <p className="font-medium text-white">Development bootstrap credentials</p>
            <p className="mt-3">Platform admin: <span className="font-mono">admin@aegisplane.dev</span></p>
            <p className="mt-1">Password: <span className="font-mono">ChangeMeNow123!</span></p>
            <p className="mt-4 text-slate-400">For tenant-scoped login you can also use <span className="font-mono">tenant.admin@aegisplane.dev</span> with tenant slug <span className="font-mono">aegisplane-internal</span>.</p>
          </div>
        </div>
        <div className="px-8 py-10">
          <h2 className="text-2xl font-semibold text-slate-950">Log in</h2>
          <p className="mt-2 text-sm text-slate-600">Use platform scope for cross-tenant administration, or provide a tenant slug for tenant-scoped access.</p>
          <form className="mt-8 space-y-5" onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate({ email, password, tenantSlug: tenantSlug || undefined });
          }}>
            <FormInput label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <FormInput label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <FormInput label="Tenant Slug" value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value)} hint="Leave blank for platform admin login." />
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            <button disabled={loginMutation.isPending} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}