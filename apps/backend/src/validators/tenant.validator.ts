import { z } from 'zod';

export const listTenantSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional()
  })
});

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    plan: z.enum(['free', 'pro', 'enterprise']),
    adminName: z.string().min(2),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(12)
  })
});

export const updateTenantPlanSchema = z.object({
  body: z.object({
    plan: z.enum(['free', 'pro', 'enterprise'])
  })
});