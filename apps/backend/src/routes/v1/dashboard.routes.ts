import { Router } from 'express';
import { getDashboardOverview } from '@/controllers/admin/dashboard.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authorize } from '@/middleware/authorize.js';

const router = Router();

router.get('/', authenticate, authorize('system:read'), getDashboardOverview);

export default router;