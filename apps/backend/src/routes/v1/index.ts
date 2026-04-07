import { Router } from 'express';
import authRoutes from '@/routes/v1/auth.routes.js';
import auditRoutes from '@/routes/v1/audit.routes.js';
import dashboardRoutes from '@/routes/v1/dashboard.routes.js';
import featuresRoutes from '@/routes/v1/features.routes.js';
import healthRoutes from '@/routes/v1/health.routes.js';
import rolesRoutes from '@/routes/v1/roles.routes.js';
import subscriptionsRoutes from '@/routes/v1/subscriptions.routes.js';
import tenantsRoutes from '@/routes/v1/tenants.routes.js';
import usersRoutes from '@/routes/v1/users.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tenants', tenantsRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/features', featuresRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/audit-logs', auditRoutes);

export default router;