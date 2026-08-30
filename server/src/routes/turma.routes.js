import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { listarTurmas } from '../controllers/turma.controller.js';

const router = Router();

router.get('/', requireAuth, listarTurmas);

export default router;
