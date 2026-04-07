import { auditQueue } from '@/jobs/queue-registry.js';
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
  async enqueue(event: AuditEvent) {
    await auditQueue.add('audit-event', event, {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 100
    });
  }

  async write(event: AuditEvent) {
    return auditLogRepository.create(event as unknown as Record<string, unknown>);
  }

  list(query: { tenantId?: string; action?: string; actorId?: string; page?: number; limit?: number }) {
    return auditLogRepository.list(query);
  }
}

export const auditService = new AuditService();