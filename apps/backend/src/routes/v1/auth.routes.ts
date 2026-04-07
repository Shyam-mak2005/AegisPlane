import { Router } from 'express';
import { getCurrentUser, login, logout, refresh } from '@/controllers/auth/auth.controller.js';
import { authenticate } from '@/middleware/authenticate.js';
import { authRateLimiter } from '@/middleware/rate-limit.js';
import { validate } from '@/middleware/validate.js';
import { loginSchema, refreshSchema } from '@/validators/auth.validator.js';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', authRateLimiter, validate(refreshSchema), refresh);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', logout);

export default router;