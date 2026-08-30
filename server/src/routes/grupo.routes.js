import { Router } from 'express';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';
import {
  adicionarIntegrante,
  criarGrupo,
  designarLider,
  designarViceLider,
  excluirGrupo,
  listarGrupos,
  removerIntegrante,
  renomearGrupo,
} from '../controllers/grupo.controller.js';

const router = Router();

router.get('/turmas/:turmaId/grupos', requireAuth, listarGrupos);
router.post('/turmas/:turmaId/grupos', requireAuth, requireRoles('professor'), criarGrupo);
router.put('/grupos/:grupoId', requireAuth, requireRoles('professor'), renomearGrupo);
router.delete('/grupos/:grupoId', requireAuth, requireRoles('professor'), excluirGrupo);
router.post('/grupos/:grupoId/integrantes', requireAuth, requireRoles('professor'), adicionarIntegrante);
router.delete('/grupos/:grupoId/integrantes/:integranteId', requireAuth, requireRoles('professor'), removerIntegrante);
router.put('/grupos/:grupoId/lider', requireAuth, requireRoles('professor'), designarLider);
router.put('/grupos/:grupoId/vice-lider', requireAuth, requireRoles('professor'), designarViceLider);

export default router;
