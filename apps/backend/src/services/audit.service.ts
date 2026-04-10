import { auditLogRepository } from '@/repositories/audit-log.repository.js';

interface AuditEvent {
  tenantId?: string;
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export class AuditService {
  async log(event: AuditEvent) {
    // Write directly to MongoDB synchronously
    return auditLogRepository.create(event as unknown as Record<string, unknown>);
  }

  list(query: { tenantId?: string; action?: string; actorId?: string; page?: number; limit?: number }) {
    return auditLogRepository.list(query);
  }
}

export const auditService = new AuditService();
