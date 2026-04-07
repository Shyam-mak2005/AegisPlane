import { Router } from 'express';
import { createUser, disableUser, getUserById, listUsers, resetUserPassword, updateUserRoles } from '@/controllers/tenants/user.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';
import { requireTenantScope } from '@/middleware/require-tenant-scope.js';
import { tenantContext } from '@/middleware/tenant-context.js';
import { validate } from '@/middleware/validate.js';
import { createUserSchema, listUserSchema, updateUserRoleSchema } from '@/validators/user.validator.js';

const router = Router();

router.use(authenticate, tenantContext, requireTenantScope);
router.get('/', authorize('user:read'), validate(listUserSchema), listUsers);
router.post('/', authorize('user:create'), validate(createUserSchema), createUser);
router.get('/:id', authorize('user:read'), getUserById);
router.patch('/:id/roles', authorize('user:update'), validate(updateUserRoleSchema), updateUserRoles);
router.post('/:id/disable', authorize('user:disable'), disableUser);
router.post('/:id/reset-password', authorize('user:update'), resetUserPassword);

export default router;