import { FormInput } from '@/components/forms/form-input';
import { PanelShell } from '@/components/feedback/status-badge';
import { PageHeader } from '@/components/layout/page-header';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Platform-wide guardrails, environment-level controls, and operational defaults for the control plane."
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Security Defaults</h3>
          <div className="mt-4 grid gap-4">
            <FormInput label="Session TTL" defaultValue="30d" />
            <FormInput label="Access Token TTL" defaultValue="15m" />
            <FormInput label="Allowed Origin" defaultValue="http://localhost:5173" />
          </div>
        </PanelShell>
        <PanelShell className="p-5">
          <h3 className="text-lg font-semibold text-slate-950">Operational Settings</h3>
          <div className="mt-4 grid gap-4">
            <FormInput label="Queue Prefix" defaultValue="aegisplane" />
            <FormInput label="Audit Retention Days" defaultValue="180" />
            <FormInput label="Log Level" defaultValue="info" />
          </div>
        </PanelShell>
      </div>
    </div>
  );
}