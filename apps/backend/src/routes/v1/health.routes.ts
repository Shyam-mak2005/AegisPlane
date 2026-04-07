import { Router } from 'express';
import { getHealth, getReadiness } from '@/controllers/admin/health.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/readiness', getReadiness);

export default router;