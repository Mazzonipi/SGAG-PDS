import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { obterDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', requireAuth, obterDashboard);

export default router;
