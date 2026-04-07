import { Router } from 'express';
import { createRole, listRoles, updateRole } from '@/controllers/tenants/role.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';
import { requireTenantScope } from '@/middleware/require-tenant-scope.js';
import { tenantContext } from '@/middleware/tenant-context.js';
import { validate } from '@/middleware/validate.js';
import { createRoleSchema, updateRoleSchema } from '@/validators/role.validator.js';

const router = Router();

router.use(authenticate, tenantContext, requireTenantScope);
router.get('/', authorize('role:read'), listRoles);
router.post('/', authorize('role:create'), validate(createRoleSchema), createRole);
router.patch('/:id', authorize('role:update'), validate(updateRoleSchema), updateRole);

export default router;