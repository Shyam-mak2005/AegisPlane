import { AlertTriangle, Building2, Server, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ActivityFeed } from '@/components/data-display/activity-feed';
import { MetricCard } from '@/components/data-display/metric-card';
import { StatusBadge } from '@/components/feedback/status-badge';
import { ChartPanel } from '@/components/charts/chart-panel';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardOverview } from '@/services/dashboard';

export default function DashboardPage() {
  const { data } = useDashboardOverview();

  if (!data) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Platform Dashboard"
        description="Track tenant growth, traffic, platform health, and recent governance activity across the shared control-plane infrastructure."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Tenants" value={String(data.metrics.totalTenants)} change="12.6% month over month" tone="accent" icon={<Building2 className="h-5 w-5" />} />
        <MetricCard label="Active Users" value={data.metrics.activeUsers.toLocaleString()} change="7.2% week over week" tone="neutral" icon={<Users className="h-5 w-5" />} />
        <MetricCard label="API Requests Today" value={data.metrics.apiRequestsToday.toLocaleString()} change="3.8% since yesterday" tone="success" icon={<Server className="h-5 w-5" />} />
        <MetricCard label="System Error Rate" value={`${(data.metrics.systemErrorRate * 100).toFixed(2)}%`} change="Down 0.4 pts this week" tone="warning" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartPanel title="Tenant Growth" subtitle="New and retained tenants over the last four reporting intervals.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.tenantGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="tenants" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ActivityFeed items={data.recentSystemEvents} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartPanel title="API Traffic" subtitle="Request volume snapshots across the current day.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.apiTraffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7deea" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="requests" fill="#0891b2" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <div className="space-y-6">
          <ChartPanel title="System Health" subtitle="Core service readiness and platform stability.">
            <div className="grid gap-4 sm:grid-cols-3">
              {data.systemHealth.map((item) => (
                <div key={item.label} className="rounded-3xl border border-line bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <div className="mt-3"><StatusBadge status={item.status} /></div>
                </div>
              ))}
            </div>
          </ChartPanel>
          <ChartPanel title="Top Active Tenants" subtitle="Tenants with the highest administrative activity footprint.">
            <div className="space-y-3">
              {data.topActiveTenants.map((tenant) => (
                <div key={tenant._id} className="flex items-center justify-between rounded-2xl border border-line bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{tenant.name}</p>
                    <p className="text-sm text-muted">{tenant.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{tenant.activeUserCount} users</p>
                    <p className="text-sm text-muted">{tenant.plan.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartPanel>
        </div>
      </div>
    </div>
  );
}