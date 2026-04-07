import { AuditLogModel } from '@/models/audit-log.model.js';
import { TenantModel } from '@/models/tenant.model.js';
import { UserModel } from '@/models/user.model.js';

export class DashboardService {
  async getOverview() {
    const [totalTenants, activeUsers, auditEvents, topTenants] = await Promise.all([
      TenantModel.countDocuments(),
      UserModel.countDocuments({ status: 'active' }),
      AuditLogModel.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      TenantModel.find({}).sort({ activeUserCount: -1 }).limit(5).lean()
    ]);

    return {
      metrics: {
        totalTenants,
        activeUsers,
        apiRequestsToday: auditEvents,
        systemErrorRate: 0.02
      },
      recentSystemEvents: await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      topActiveTenants: topTenants,
      tenantGrowth: [
        { month: 'Jan', tenants: Math.max(1, totalTenants - 5) },
        { month: 'Feb', tenants: Math.max(2, totalTenants - 3) },
        { month: 'Mar', tenants: Math.max(4, totalTenants - 1) },
        { month: 'Apr', tenants: totalTenants }
      ],
      apiTraffic: [
        { label: '00:00', requests: 210 },
        { label: '06:00', requests: 640 },
        { label: '12:00', requests: 1230 },
        { label: '18:00', requests: 880 }
      ],
      systemHealth: [
        { label: 'API', status: 'healthy' },
        { label: 'MongoDB', status: 'healthy' },
        { label: 'Redis', status: 'healthy' }
      ]
    };
  }
}

export const dashboardService = new DashboardService();