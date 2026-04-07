import { TenantModel } from '@/models/tenant.model.js';
import { getPagination } from '@/shared/utils/pagination.js';
import type { PaginationQuery } from '@/types/http.js';

export class TenantRepository {
  async list(query: PaginationQuery) {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = query.search
      ? {
          $or: [
            { name: { $regex: query.search, $options: 'i' } },
            { slug: { $regex: query.search, $options: 'i' } }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      TenantModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      TenantModel.countDocuments(filter)
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  findById(id: string) {
    return TenantModel.findById(id).lean();
  }

  findBySlug(slug: string) {
    return TenantModel.findOne({ slug }).lean();
  }

  create(payload: Record<string, unknown>) {
    return TenantModel.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return TenantModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }
}

export const tenantRepository = new TenantRepository();