import { plans } from '@/shared/constants/plans.js';
import { subscriptionRepository } from '@/repositories/subscription.repository.js';
import { auditService } from '@/services/audit.service.js';

export class SubscriptionService {
  listPlans() {
    return Object.values(plans);
  }

  getTenantSubscription(tenantId: string) {
    return subscriptionRepository.findByTenantId(tenantId);
  }

  async upsertForTenant(tenantId: string, plan: 'free' | 'pro' | 'enterprise', actorId?: string) {
    const definition = plans[plan];
    const subscription = await subscriptionRepository.upsert(tenantId, {
      tenantId,
      plan,
      status: 'active',
      apiRateLimitPerMinute: definition.apiRateLimitPerMinute,
      enabledFeatures: definition.features,
      seats: definition.maxUsers
    });

    if (actorId) {
      await auditService.enqueue({
        tenantId,
        actorId,
        action: 'subscription.upsert',
        resourceType: 'subscription',
        resourceId: tenantId,
        metadata: { plan }
      });
    }

    return subscription;
  }
}

export const subscriptionService = new SubscriptionService();