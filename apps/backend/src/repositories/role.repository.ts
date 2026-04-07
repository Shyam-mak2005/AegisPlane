import { RoleModel } from '@/models/role.model.js';

export class RoleRepository {
  list(tenantId?: string) {
    const filter = tenantId ? { tenantId, scope: 'tenant' } : { scope: 'platform' };
    return RoleModel.find(filter).sort({ scope: 1, name: 1 }).lean();
  }

  findByIds(ids: string[]) {
    return RoleModel.find({ _id: { $in: ids } }).lean();
  }

  findById(id: string) {
    return RoleModel.findById(id).lean();
  }

  findByIdInTenant(id: string, tenantId: string) {
    return RoleModel.findOne({
      _id: id,
      $or: [{ tenantId }, { scope: 'platform' }]
    }).lean();
  }

  create(payload: Record<string, unknown>) {
    return RoleModel.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return RoleModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  updateInTenant(id: string, tenantId: string, payload: Record<string, unknown>) {
    return RoleModel.findOneAndUpdate({ _id: id, tenantId }, payload, { new: true }).lean();
  }
}

export const roleRepository = new RoleRepository();