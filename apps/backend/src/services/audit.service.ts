import { isRedisConfigured } from '@/config/redis.js';
import { auditLogRepository } from '@/repositories/audit-log.repository.js';
import { logger } from '@/shared/logger/logger.js';

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
    if (!isRedisConfigured()) {
      return this.write(event);
    }

    try {
      const { auditQueue } = await import('@/jobs/queue-registry.js');
      await auditQueue.add('audit-event', event, {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 100
      });
    } catch (error) {
      logger.warn({ err: error, action: event.action }, 'Failed to enqueue audit event; writing directly to MongoDB');
      await this.write(event);
    }
  }

  async write(event: AuditEvent) {
    return auditLogRepository.create(event as unknown as Record<string, unknown>);
  }

  list(query: { tenantId?: string; action?: string; actorId?: string; page?: number; limit?: number }) {
    return auditLogRepository.list(query);
  }
}

export const auditService = new AuditService();
