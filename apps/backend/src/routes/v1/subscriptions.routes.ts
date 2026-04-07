import { Router } from 'express';
import { getTenantSubscription, listPlans } from '@/controllers/tenants/subscription.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';
import { tenantContext } from '@/middleware/tenant-context.js';

const router = Router();

router.use(authenticate);
router.get('/plans', authorize('subscription:read'), listPlans);
router.get('/tenant/:tenantId', tenantContext, authorize('subscription:read'), getTenantSubscription);

export default router;