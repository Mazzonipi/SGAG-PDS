import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { loginLimiter, registroLimiter } from '../config/rateLimit.js';
import { cadastrar, login, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/cadastrar', registroLimiter, cadastrar);
router.get('/me', requireAuth, me);

export default router;
