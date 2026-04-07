import { Router } from 'express';
import { listFeatureFlags, updateFeatureFlag } from '@/controllers/tenants/feature-flag.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';
import { requirePlatformAdmin } from '@/middleware/require-platform-admin.js';
import { validate } from '@/middleware/validate.js';
import { updateFeatureFlagSchema } from '@/validators/feature-flag.validator.js';

const router = Router();

router.use(authenticate);
router.use(requirePlatformAdmin);
router.get('/', authorize('featureFlag:read'), listFeatureFlags);
router.patch('/:key', authorize('featureFlag:update'), validate(updateFeatureFlagSchema), updateFeatureFlag);

export default router;