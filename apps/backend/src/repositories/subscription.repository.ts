import { SubscriptionModel } from '@/models/subscription.model.js';

export class SubscriptionRepository {
  list() {
    return SubscriptionModel.find({}).sort({ updatedAt: -1 }).lean();
  }

  findByTenantId(tenantId: string) {
    return SubscriptionModel.findOne({ tenantId }).lean();
  }

  upsert(tenantId: string, payload: Record<string, unknown>) {
    return SubscriptionModel.findOneAndUpdate({ tenantId }, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }).lean();
  }
}

export const subscriptionRepository = new SubscriptionRepository();