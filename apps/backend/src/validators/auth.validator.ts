import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    tenantSlug: z.string().trim().optional()
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});