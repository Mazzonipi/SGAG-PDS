import { asyncHandler } from '../middlewares/error.middleware.js';
import {
  adicionarIntegranteSchema,
  criarGrupoSchema,
  designarPapelSchema,
  renomearGrupoSchema,
} from '../validations/schemas.js';
import * as grupoService from '../services/grupo.service.js';

/**
 * GET /api/turmas/:turmaId/grupos — Lista os grupos de uma turma.
 */
export const listarGrupos = asyncHandler(async (req, res) => {
  const { turmaId } = req.params;
  const grupos = await grupoService.listarGruposDaTurma(turmaId);
  res.json({ grupos });
});

/**
 * POST /api/turmas/:turmaId/grupos — Cria grupo (professor). Valida limite de 5.
 */
export const criarGrupo = asyncHandler(async (req, res) => {
  const { turmaId } = req.params;
  const dados = criarGrupoSchema.parse(req.body);
  const grupo = await grupoService.criarGrupo({ turmaId, nome: dados.nome, professorId: req.user.id });
  res.status(201).json({ grupo });
});

/**
 * PUT /api/grupos/:grupoId — Renomeia grupo (professor).
 */
export const renomearGrupo = asyncHandler(async (req, res) => {
  const { grupoId } = req.params;
  const dados = renomearGrupoSchema.parse(req.body);
  const grupo = await grupoService.renomearGrupo({ grupoId, nome: dados.nome, professorId: req.user.id });
  res.json({ grupo });
});

/**
 * DELETE /api/grupos/:grupoId — Exclui grupo (professor).
 */
export const excluirGrupo = asyncHandler(async (req, res) => {
  const { grupoId } = req.params;
  const resultado = await grupoService.excluirGrupo({ grupoId, professorId: req.user.id });
  res.json(resultado);
});

/**
 * POST /api/grupos/:grupoId/integrantes — Adiciona integrante (professor). Valida limite de 7.
 */
export const adicionarIntegrante = asyncHandler(async (req, res) => {
  const { grupoId } = req.params;
  const dados = adicionarIntegranteSchema.parse(req.body);
  const integrante = await grupoService.adicionarIntegrante({
    grupoId,
    nomeAluno: dados.nome_aluno,
    professorId: req.user.id,
  });
  res.status(201).json({ integrante });
});

/**
 * DELETE /api/grupos/:grupoId/integrantes/:integranteId — Remove integrante (professor).
 */
export const removerIntegrante = asyncHandler(async (req, res) => {
  const { grupoId, integranteId } = req.params;
  const resultado = await grupoService.removerIntegrante({
    grupoId,
    integranteId,
    professorId: req.user.id,
  });
  res.json(resultado);
});

/**
 * PUT /api/grupos/:grupoId/lider — Designa Líder (professor).
 */
export const designarLider = asyncHandler(async (req, res) => {
  const { grupoId } = req.params;
  const dados = designarPapelSchema.parse(req.body);
  const resultado = await grupoService.designarLider({
    grupoId,
    perfilId: dados.perfil_id,
    professorId: req.user.id,
  });
  res.json(resultado);
});

/**
 * PUT /api/grupos/:grupoId/vice-lider — Designa Vice-Líder (professor).
 */
export const designarViceLider = asyncHandler(async (req, res) => {
  const { grupoId } = req.params;
  const dados = designarPapelSchema.parse(req.body);
  const resultado = await grupoService.designarViceLider({
    grupoId,
    perfilId: dados.perfil_id,
    professorId: req.user.id,
  });
  res.json(resultado);
});
