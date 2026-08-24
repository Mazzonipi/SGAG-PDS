import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';
import { registrarAuditoria } from '../utils/audit.js';

/** Limite máximo de grupos por turma (regra de negócio). */
export const LIMITE_GRUPOS_POR_TURMA = 5;

/** Limite máximo de integrantes por grupo (regra de negócio). */
export const LIMITE_INTEGRANTES_POR_GRUPO = 7;

/**
 * Busca uma turma pelo UUID e garante que ela existe.
 *
 * @param {string} turmaId UUID da turma.
 * @returns {Promise<Object>} Turma encontrada.
 * @throws {AppError} 404 se a turma não existir.
 */
async function buscarTurma(turmaId) {
  const { data: turma, error } = await supabaseAdmin
    .from('turmas')
    .select('id, nome')
    .eq('id', turmaId)
    .maybeSingle();

  if (error || !turma) {
    throw new AppError(404, 'Turma nao encontrada');
  }

  return turma;
}

/**
 * Busca um grupo pelo UUID e garante que ele existe.
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
 * Busca um perfil pelo UUID.
 *
 * @param {string} perfilId UUID do perfil.
 * @returns {Promise<Object>} Perfil encontrado.
 * @throws {AppError} 404 se o perfil não existir.
 */
async function buscarPerfil(perfilId) {
  const { data: perfil, error } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, email, role, is_active')
    .eq('id', perfilId)
    .maybeSingle();

  if (error || !perfil) {
    throw new AppError(404, 'Perfil nao encontrado');
  }

  return perfil;
}

/**
 * Lista os grupos de uma turma com líder, vice-líder e integrantes.
 *
 * @param {string} turmaId UUID da turma.
 * @returns {Promise<Array<Object>>} Lista de grupos.
 */
export async function listarGruposDaTurma(turmaId) {
  await buscarTurma(turmaId);

  const { data, error } = await supabaseAdmin
    .from('grupos')
    .select(
      'id, nome, lider_id, vice_lider_id, ' +
        'lider:profiles!lider_id(id, nome), ' +
        'vice:profiles!vice_lider_id(id, nome), ' +
        'integrantes(id, nome_aluno)'
    )
    .eq('turma_id', turmaId)
    .order('nome');

  if (error) {
    throw new AppError(500, 'Falha ao listar grupos');
  }

  return data;
}

/**
 * Cria um novo grupo na turma, respeitando o limite máximo de 5 grupos.
 *
 * @param {Object} params Parâmetros de criação.
 * @param {string} params.turmaId UUID da turma.
 * @param {string} params.nome Nome do grupo.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<Object>} Grupo criado.
 * @throws {AppError} 400 se a turma já atingir o limite de grupos.
 */
export async function criarGrupo({ turmaId, nome, professorId }) {
  await buscarTurma(turmaId);

  const { count, error: countError } = await supabaseAdmin
    .from('grupos')
    .select('id', { count: 'exact', head: true })
    .eq('turma_id', turmaId);

  const total = count ?? 0;

  if (countError) {
    throw new AppError(500, 'Falha ao validar limite de grupos');
  }

  if (total >= LIMITE_GRUPOS_POR_TURMA) {
    throw new AppError(
      400,
      `A turma ja atingiu o limite maximo de ${LIMITE_GRUPOS_POR_TURMA} grupos`
    );
  }

  const { data, error } = await supabaseAdmin
    .from('grupos')
    .insert({ turma_id: turmaId, nome })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'Ja existe um grupo com esse nome nesta turma');
    }
    throw new AppError(400, `Falha ao criar grupo: ${error.message}`);
  }

  await registrarAuditoria('grupos', data.id, 'INSERT', professorId, { turma_id: turmaId, nome });

  return data;
}

/**
 * Renomeia um grupo existente.
 *
 * @param {Object} params Parâmetros de renomeação.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.nome Novo nome do grupo.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<Object>} Grupo atualizado.
 */
export async function renomearGrupo({ grupoId, nome, professorId }) {
  await buscarGrupo(grupoId);

  const { data, error } = await supabaseAdmin
    .from('grupos')
    .update({ nome })
    .eq('id', grupoId)
    .select()
    .single();

  if (error) {
    throw new AppError(400, `Falha ao renomear grupo: ${error.message}`);
  }

  await registrarAuditoria('grupos', grupoId, 'UPDATE', professorId, { tipo: 'renomear', novo_nome: nome });

  return data;
}

/**
 * Exclui um grupo e todos os seus integrantes/avaliações (ON DELETE CASCADE).
 *
 * @param {Object} params Parâmetros de exclusão.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<{success: boolean}>} Resultado da operação.
 */
export async function excluirGrupo({ grupoId, professorId }) {
  const grupo = await buscarGrupo(grupoId);

  const { error } = await supabaseAdmin.from('grupos').delete().eq('id', grupoId);

  if (error) {
    throw new AppError(400, `Falha ao excluir grupo: ${error.message}`);
  }

  await registrarAuditoria('grupos', grupoId, 'DELETE', professorId, { nome: grupo.nome, turma_id: grupo.turma_id });

  return { success: true };
}

/**
 * Adiciona um integrante (aluno comum, sem conta) ao grupo,
 * respeitando o limite máximo de 7 integrantes.
 *
 * @param {Object} params Parâmetros de adição.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.nomeAluno Nome do aluno.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<Object>} Integrante criado.
 * @throws {AppError} 400 se o grupo já atingir o limite de integrantes.
 */
export async function adicionarIntegrante({ grupoId, nomeAluno, professorId }) {
  await buscarGrupo(grupoId);

  const { count, error: countError } = await supabaseAdmin
    .from('integrantes')
    .select('id', { count: 'exact', head: true })
    .eq('grupo_id', grupoId);

  const total = count ?? 0;

  if (countError) {
    throw new AppError(500, 'Falha ao validar limite de integrantes');
  }

  if (total >= LIMITE_INTEGRANTES_POR_GRUPO) {
    throw new AppError(
      400,
      `O grupo ja atingiu o limite maximo de ${LIMITE_INTEGRANTES_POR_GRUPO} integrantes`
    );
  }

  const { data, error } = await supabaseAdmin
    .from('integrantes')
    .insert({ grupo_id: grupoId, nome_aluno: nomeAluno })
    .select()
    .single();

  if (error) {
    throw new AppError(400, `Falha ao adicionar integrante: ${error.message}`);
  }

  await registrarAuditoria('integrantes', data.id, 'INSERT', professorId, {
    grupo_id: grupoId,
    nome_aluno: nomeAluno,
  });

  return data;
}

/**
 * Remove um integrante do grupo.
 *
 * @param {Object} params Parâmetros de remoção.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.integranteId UUID do integrante.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<{success: boolean}>} Resultado da operação.
 */
export async function removerIntegrante({ grupoId, integranteId, professorId }) {
  await buscarGrupo(grupoId);

  const { data: integrante, error: buscaError } = await supabaseAdmin
    .from('integrantes')
    .select('id, nome_aluno')
    .eq('id', integranteId)
    .eq('grupo_id', grupoId)
    .maybeSingle();

  if (buscaError || !integrante) {
    throw new AppError(404, 'Integrante nao encontrado no grupo');
  }

  const { error } = await supabaseAdmin
    .from('integrantes')
    .delete()
    .eq('id', integranteId)
    .eq('grupo_id', grupoId);

  if (error) {
    throw new AppError(400, `Falha ao remover integrante: ${error.message}`);
  }

  await registrarAuditoria('integrantes', integranteId, 'DELETE', professorId, {
    grupo_id: grupoId,
    nome_aluno: integrante.nome_aluno,
  });

  return { success: true };
}

/**
 * Designa o Líder de um grupo (exclusivo do Professor).
 * Valida que o perfil possui o papel 'lider' e está ativo.
 *
 * @param {Object} params Parâmetros de designação.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.perfilId UUID do perfil designado.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<{id: string, lider_id: string}>} Grupo atualizado.
 */
export async function designarLider({ grupoId, perfilId, professorId }) {
  const grupo = await buscarGrupo(grupoId);
  const perfil = await buscarPerfil(perfilId);

  if (perfil.role !== 'lider') {
    throw new AppError(400, 'O perfil indicado nao possui o papel de lider');
  }

  if (perfil.is_active === false) {
    throw new AppError(400, 'Perfil desativado');
  }

  if (grupo.vice_lider_id === perfilId) {
    throw new AppError(400, 'O perfil ja e o vice-lider deste grupo');
  }

  const { error } = await supabaseAdmin.from('grupos').update({ lider_id: perfilId }).eq('id', grupoId);

  if (error) {
    throw new AppError(400, `Falha ao designar lider: ${error.message}`);
  }

  await registrarAuditoria('grupos', grupoId, 'UPDATE', professorId, {
    tipo: 'designar_lider',
    perfil_id: perfilId,
  });

  return { id: grupoId, lider_id: perfilId };
}

/**
 * Designa o Vice-Líder de um grupo (exclusivo do Professor).
 * Valida que o perfil possui o papel 'vice_lider' e está ativo.
 *
 * @param {Object} params Parâmetros de designação.
 * @param {string} params.grupoId UUID do grupo.
 * @param {string} params.perfilId UUID do perfil designado.
 * @param {string} params.professorId UUID do professor executor.
 * @returns {Promise<{id: string, vice_lider_id: string}>} Grupo atualizado.
 */
export async function designarViceLider({ grupoId, perfilId, professorId }) {
  const grupo = await buscarGrupo(grupoId);
  const perfil = await buscarPerfil(perfilId);

  if (perfil.role !== 'vice_lider') {
    throw new AppError(400, 'O perfil indicado nao possui o papel de vice-lider');
  }

  if (perfil.is_active === false) {
    throw new AppError(400, 'Perfil desativado');
  }

  if (grupo.lider_id === perfilId) {
    throw new AppError(400, 'O perfil ja e o lider deste grupo');
  }

  const { error } = await supabaseAdmin
    .from('grupos')
    .update({ vice_lider_id: perfilId })
    .eq('id', grupoId);

  if (error) {
    throw new AppError(400, `Falha ao designar vice-lider: ${error.message}`);
  }

  await registrarAuditoria('grupos', grupoId, 'UPDATE', professorId, {
    tipo: 'designar_vice_lider',
    perfil_id: perfilId,
  });

  return { id: grupoId, vice_lider_id: perfilId };
}
