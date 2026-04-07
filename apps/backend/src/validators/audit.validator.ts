import { z } from 'zod';

export const listAuditLogSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    action: z.string().optional(),
    actorId: z.string().optional()
  })
});