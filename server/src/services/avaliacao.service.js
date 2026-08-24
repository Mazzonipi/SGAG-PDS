import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';
import { registrarAuditoria } from '../utils/audit.js';

/**
 * Busca um grupo e garante que ele existe.
 *
 * @param {string} grupoId UUID do grupo.
 * @returns {Promise<Object>} Grupo encontrado.
 * @throws {AppError} 404 se o grupo não existir.
 */
async function buscarGrupo(grupoId) {
  const { data: grupo, error } = await supabaseAdmin
    .from('grupos')
    .select('id, turma_id, nome, lider_id, vice_lider_id')
    .eq('id', grupoId)
    .maybeSingle();

  if (error || !grupo) {
    throw new AppError(404, 'Grupo nao encontrado');
  }

  return grupo;
}

/**
 * Busca um integrante e garante que pertence ao grupo informado.
 *
 * @param {string} grupoId UUID do grupo.
 * @param {string} integranteId UUID do integrante.
 * @returns {Promise<Object>} Integrante encontrado.
 * @throws {AppError} 404 se o integrante não pertencer ao grupo.
 */
async function buscarIntegranteDoGrupo(grupoId, integranteId) {
  const { data: integrante, error } = await supabaseAdmin
    .from('integrantes')
    .select('id, nome_aluno')
    .eq('id', integranteId)
    .eq('grupo_id', grupoId)
    .maybeSingle();

  if (error || !integrante) {
    throw new AppError(404, 'Integrante nao encontrado no grupo');
  }

  return integrante;
}

/**
 * Calcula a permissão de edição de avaliações para o usuário no grupo.
 *
 * Regras:
 * - Professor: sempre pode editar.
 * - Líder: pode editar (se for o líder do grupo).
 * - Vice-Líder: pode editar apenas se o Líder ainda não tiver submetido.
 *
 * @param {Object} grupo Grupo consultado.
 * @param {Object} avaliacoes Avaliações existentes do grupo.
 * @param {Object} usuario Usuário autenticado.
 * @returns {{podeEditar: boolean, motivo: string|null, liderSubmeteu: boolean}} Resultado da análise.
 */
function calcularPermissao(grupo, avaliacoes, usuario) {
  const liderSubmeteu = avaliacoes.some((a) => a.avaliador_id === grupo.lider_id);

  let podeEditar = false;
  let motivo = null;

  if (usuario.role === 'professor') {
    podeEditar = true;
  } else if (usuario.role === 'lider') {
    podeEditar = usuario.id === grupo.lider_id;
    if (!podeEditar) motivo = 'Voce nao e o lider deste grupo';
  } else if (usuario.role === 'vice_lider') {
    podeEditar = usuario.id === grupo.vice_lider_id;
    if (!podeEditar) {
      motivo = 'Voce nao e o vice-lider deste grupo';
    } else if (liderSubmeteu) {
      podeEditar = false;
      motivo = 'O lider ja submeteu as notas; formulario em modo somente leitura';
    }
  } else {
    motivo = 'Perfil sem permissao para avaliar';
  }

  return { podeEditar, motivo, liderSubmeteu };
}

/**
 * Lista as avaliações do grupo juntamente com os integrantes e a
 * permissão de edição do usuário autenticado.
 *
 * @param {string} grupoId UUID do grupo.
 * @param {Object} usuario Usuário autenticado.
 * @returns {Promise<Object>} Grupo, integrantes com avaliação e permissão.
 */
export async function listarAvaliacoes(grupoId, usuario) {
  const grupo = await buscarGrupo(grupoId);

  const [resultIntegrantes, resultAvaliacoes] = await Promise.all([
    supabaseAdmin.from('integrantes').select('id, nome_aluno').eq('grupo_id', grupoId).order('nome_aluno'),
    supabaseAdmin.from('avaliacoes').select('*').eq('grupo_id', grupoId),
  ]);

  if (resultIntegrantes.error || resultAvaliacoes.error) {
    throw new AppError(500, 'Falha ao listar avaliacoes');
  }

  const integrantes = resultIntegrantes.data.map((integrante) => ({
    ...integrante,
    avaliacao: resultAvaliacoes.data.find((a) => a.integrante_id === integrante.id) ?? null,
  }));

  return {
    grupo: { id: grupo.id, turma_id: grupo.turma_id, nome: grupo.nome, lider_id: grupo.lider_id, vice_lider_id: grupo.vice_lider_id },
    integrantes,
    permissao: calcularPermissao(grupo, resultAvaliacoes.data, usuario),
  };
}

/**
 * Submete (cria ou atualiza) a avaliação individual de um integrante.
 *
 * Trava de concorrência Líder vs. Vice-Líder:
 * - O Líder tem prioridade e pode submeter/sobrescrever a qualquer momento.
 * - O Vice-Líder só pode submeter se o Líder ainda não tiver submetido.
 * - O Professor sempre pode submeter, exigindo comentário de esclarecimento.
 *
 * @param {Object} params Parâmetros da submissão.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.integranteId UUID do integrante avaliado.
 * @param {Object} params.notas Critérios validados (interesse, entrega_prazo, participacao, qualidade_trabalho, respeito_grupo).
 * @param {Object} params.usuario Usuário autenticado.
 * @returns {Promise<Object>} Avaliação persistida.
 * @throws {AppError} 400/403 em violações de permissão ou validação.
 */
export async function submeterAvaliacao({ grupoId, integranteId, notas, usuario }) {
  const grupo = await buscarGrupo(grupoId);
  await buscarIntegranteDoGrupo(grupoId, integranteId);

  const { data: existente } = await supabaseAdmin
    .from('avaliacoes')
    .select('*')
    .eq('grupo_id', grupoId)
    .eq('integrante_id', integranteId)
    .maybeSingle();

  if (usuario.role === 'professor') {
    if (!notas.comentario_esclarecimento?.trim()) {
      throw new AppError(400, 'O comentario de esclarecimento e obrigatorio para o professor');
    }
  } else if (usuario.role === 'lider') {
    if (usuario.id !== grupo.lider_id) {
      throw new AppError(403, 'Apenas o lider do grupo pode submeter as notas');
    }
  } else if (usuario.role === 'vice_lider') {
    if (usuario.id !== grupo.vice_lider_id) {
      throw new AppError(403, 'Apenas o vice-lider do grupo pode submeter as notas');
    }
    if (existente?.avaliador_id === grupo.lider_id) {
      throw new AppError(403, 'O lider ja submeteu as notas; o vice-lider esta em modo somente leitura');
    }
  } else {
    throw new AppError(403, 'Perfil sem permissao para avaliar');
  }

  const alteradoPorProfessor = usuario.role === 'professor';

  const payload = {
    grupo_id: grupoId,
    integrante_id: integranteId,
    avaliador_id: usuario.id,
    interesse: notas.interesse,
    entrega_prazo: notas.entrega_prazo,
    participacao: notas.participacao,
    qualidade_trabalho: notas.qualidade_trabalho,
    respeito_grupo: notas.respeito_grupo,
    alterado_por_professor: alteradoPorProfessor,
    comentario_esclarecimento: notas.comentario_esclarecimento?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('avaliacoes')
    .upsert(payload, { onConflict: 'grupo_id,integrante_id' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'Ja existe uma avaliacao para este integrante');
    }
    throw new AppError(400, `Falha ao submeter avaliacao: ${error.message}`);
  }

  await registrarAuditoria('avaliacoes', data.id, existente ? 'UPDATE' : 'INSERT', usuario.id, {
    grupo_id: grupoId,
    integrante_id: integranteId,
    criterios: {
      interesse: notas.interesse,
      entrega_prazo: notas.entrega_prazo,
      participacao: notas.participacao,
      qualidade_trabalho: notas.qualidade_trabalho,
      respeito_grupo: notas.respeito_grupo,
    },
    alterado_por_professor: alteradoPorProfessor,
    comentario_esclarecimento: payload.comentario_esclarecimento,
  });

  return data;
}

/**
 * Exclui a avaliação de um integrante (exclusivo do Professor),
 * exigindo comentário de esclarecimento para fins de auditoria.
 *
 * @param {Object} params Parâmetros da exclusão.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.integranteId UUID do integrante.
 * @param {string} params.comentario Justificativa obrigatória.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<{success: boolean}>} Resultado da operação.
 */
export async function excluirAvaliacao({ grupoId, integranteId, comentario, professorId }) {
  const { data: existente } = await supabaseAdmin
    .from('avaliacoes')
    .select('*')
    .eq('grupo_id', grupoId)
    .eq('integrante_id', integranteId)
    .maybeSingle();

  if (!existente) {
    throw new AppError(404, 'Avaliacao nao encontrada');
  }

  const { error } = await supabaseAdmin
    .from('avaliacoes')
    .delete()
    .eq('grupo_id', grupoId)
    .eq('integrante_id', integranteId);

  if (error) {
    throw new AppError(400, `Falha ao excluir avaliacao: ${error.message}`);
  }

  await registrarAuditoria('avaliacoes', existente.id, 'DELETE', professorId, {
    nota_antiga: existente,
    comentario_esclarecimento: comentario,
  });

  return { success: true };
}
