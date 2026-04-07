import { UserModel } from '@/models/user.model.js';
import { getPagination } from '@/shared/utils/pagination.js';
import type { PaginationQuery } from '@/types/http.js';

export class UserRepository {
  async list(tenantId: string, query: PaginationQuery) {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = {
      tenantId,
      ...(query.search
        ? {
            $or: [
              { displayName: { $regex: query.search, $options: 'i' } },
              { email: { $regex: query.search, $options: 'i' } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      UserModel.find(filter).sort(sort).skip(skip).limit(limit).populate('roleIds').lean(),
      UserModel.countDocuments(filter)
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  findByEmail(email: string, tenantId?: string | null) {
    const filter: Record<string, unknown> = { email };
    if (tenantId !== undefined) {
      filter.tenantId = tenantId === null ? null : tenantId;
    }

    return UserModel.findOne(filter).select('+passwordHash').populate('roleIds');
  }

  findById(id: string) {
    return UserModel.findById(id).populate('roleIds').lean();
  }

  findByIdInTenant(id: string, tenantId: string) {
    return UserModel.findOne({ _id: id, tenantId }).populate('roleIds').lean();
  }

  create(payload: Record<string, unknown>) {
    return UserModel.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return UserModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  updateInTenant(id: string, tenantId: string, payload: Record<string, unknown>) {
    return UserModel.findOneAndUpdate({ _id: id, tenantId }, payload, { new: true }).lean();
  }

  countActiveByTenant(tenantId: string) {
    return UserModel.countDocuments({ tenantId, status: 'active' });
  }
}

export const userRepository = new UserRepository();