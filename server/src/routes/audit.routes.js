import { Router } from 'express';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';
import { listarLogs } from '../controllers/audit.controller.js';

const router = Router();

router.get('/', requireAuth, requireRoles('professor'), listarLogs);

export default router;
