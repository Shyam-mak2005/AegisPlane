import { Router } from 'express';
import { createTenant, getTenantById, listTenants, suspendTenant, updateTenantPlan } from '@/controllers/tenants/tenant.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';
import { requirePlatformAdmin } from '@/middleware/require-platform-admin.js';
import { validate } from '@/middleware/validate.js';
import { createTenantSchema, listTenantSchema, updateTenantPlanSchema } from '@/validators/tenant.validator.js';

const router = Router();

router.use(authenticate);
router.use(requirePlatformAdmin);
router.get('/', authorize('tenant:read'), validate(listTenantSchema), listTenants);
router.post('/', authorize('tenant:create'), validate(createTenantSchema), createTenant);
router.get('/:id', authorize('tenant:read'), getTenantById);
router.post('/:id/suspend', authorize('tenant:update'), suspendTenant);
router.patch('/:id/plan', authorize('subscription:update'), validate(updateTenantPlanSchema), updateTenantPlan);

export default router;