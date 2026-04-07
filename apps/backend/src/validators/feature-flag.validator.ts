import { z } from 'zod';

export const updateFeatureFlagSchema = z.object({
  body: z.object({
    description: z.string().optional(),
    enabledByDefault: z.boolean().optional(),
    rolloutPercentage: z.number().min(0).max(100).optional(),
    plansEnabled: z.array(z.string()).optional(),
    tenantOverrides: z.array(z.object({
      tenantId: z.string(),
      enabled: z.boolean()
    })).optional()
  })
});