import { asyncHandler } from '../middlewares/error.middleware.js';
import { avaliacaoSchema, excluirAvaliacaoSchema } from '../validations/schemas.js';
import * as avaliacaoService from '../services/avaliacao.service.js';

/**
 * GET /api/grupos/:grupoId/avaliacoes — Lista avaliações do grupo com permissão de edição.
 */
export const listarAvaliacoes = asyncHandler(async (req, res) => {
  const { grupoId } = req.params;
  const resultado = await avaliacaoService.listarAvaliacoes(grupoId, req.user);
  res.json(resultado);
});

/**
 * PUT /api/grupos/:grupoId/avaliacoes/:integranteId — Submete avaliação.
 * Aplica a trava Líder/Vice-Líder e a exigência de esclarecimento do Professor.
 */
export const submeterAvaliacao = asyncHandler(async (req, res) => {
  const { grupoId, integranteId } = req.params;
  const dados = avaliacaoSchema.parse(req.body);
  const avaliacao = await avaliacaoService.submeterAvaliacao({
    grupoId,
    integranteId,
    notas: dados,
    usuario: req.user,
  });
  res.status(201).json({ avaliacao });
});

/**
 * DELETE /api/grupos/:grupoId/avaliacoes/:integranteId — Exclui avaliação (professor).
 */
export const excluirAvaliacao = asyncHandler(async (req, res) => {
  const { grupoId, integranteId } = req.params;
  const dados = excluirAvaliacaoSchema.parse(req.body);
  const resultado = await avaliacaoService.excluirAvaliacao({
    grupoId,
    integranteId,
    comentario: dados.comentario_esclarecimento,
    professorId: req.user.id,
  });
  res.json(resultado);
});
