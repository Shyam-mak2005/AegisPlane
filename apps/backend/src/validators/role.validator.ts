import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    permissionKeys: z.array(z.string()).min(1)
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    description: z.string().optional(),
    permissionKeys: z.array(z.string()).min(1)
  })
});