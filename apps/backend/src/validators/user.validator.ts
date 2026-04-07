import { z } from 'zod';

export const listUserSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional()
  })
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    displayName: z.string().min(2),
    roleIds: z.array(z.string()).min(1)
  })
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    roleIds: z.array(z.string()).min(1)
  })
});