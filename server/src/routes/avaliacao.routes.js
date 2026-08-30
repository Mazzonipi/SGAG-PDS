import { Router } from 'express';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';
import { excluirAvaliacao, listarAvaliacoes, submeterAvaliacao } from '../controllers/avaliacao.controller.js';

const router = Router();

router.get('/grupos/:grupoId/avaliacoes', requireAuth, listarAvaliacoes);
router.put('/grupos/:grupoId/avaliacoes/:integranteId', requireAuth, submeterAvaliacao);
router.delete(
  '/grupos/:grupoId/avaliacoes/:integranteId',
  requireAuth,
  requireRoles('professor'),
  excluirAvaliacao
);

export default router;
