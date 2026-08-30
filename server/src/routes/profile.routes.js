import { Router } from 'express';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';
import { criarPerfil, listarPerfis } from '../controllers/profile.controller.js';

const router = Router();

router.post('/', requireAuth, requireRoles('professor'), criarPerfil);
router.get('/', requireAuth, requireRoles('professor'), listarPerfis);

export default router;
