import { Router } from 'express';
import { listAuditLogs } from '@/controllers/tenants/audit.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';
import { tenantContext } from '@/middleware/tenant-context.js';
import { validate } from '@/middleware/validate.js';
import { listAuditLogSchema } from '@/validators/audit.validator.js';

const router = Router();

router.use(authenticate, tenantContext);
router.get('/', authorize('audit:read'), validate(listAuditLogSchema), listAuditLogs);

export default router;