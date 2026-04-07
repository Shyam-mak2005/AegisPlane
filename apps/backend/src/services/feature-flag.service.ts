import { featureFlagRepository } from '@/repositories/feature-flag.repository.js';
import { auditService } from '@/services/audit.service.js';

export class FeatureFlagService {
  list() {
    return featureFlagRepository.list();
  }

  async update(key: string, payload: { description?: string; enabledByDefault?: boolean; rolloutPercentage?: number; plansEnabled?: string[]; tenantOverrides?: Array<{ tenantId: string; enabled: boolean }> }, actorId?: string) {
    const flag = await featureFlagRepository.update(key, payload);
    await auditService.enqueue({
      actorId,
      tenantId: undefined,
      action: 'featureFlag.update',
      resourceType: 'featureFlag',
      resourceId: key,
      metadata: payload
    });
    return flag;
  }
}

export const featureFlagService = new FeatureFlagService();