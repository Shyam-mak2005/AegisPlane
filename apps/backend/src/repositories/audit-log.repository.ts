import { AuditLogModel } from '@/models/audit-log.model.js';
import { getPagination } from '@/shared/utils/pagination.js';
import type { PaginationQuery } from '@/types/http.js';

export class AuditLogRepository {
  create(payload: Record<string, unknown>) {
    return AuditLogModel.create(payload);
  }

  async list(query: PaginationQuery & { tenantId?: string; action?: string; actorId?: string }) {
    const { page, limit, skip } = getPagination(query);
    const filter = {
      ...(query.tenantId ? { tenantId: query.tenantId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {})
    };

    const [items, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLogModel.countDocuments(filter)
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export const auditLogRepository = new AuditLogRepository();