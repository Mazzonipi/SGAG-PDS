import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Obtém as métricas do dashboard ([BANCA-02]):
 * total de turmas, total de grupos e status de avaliações (concluídas/pendentes).
 * Aceita filtro opcional por turma.
 *
 * @param {Object} params Parâmetros da consulta.
 * @param {string|undefined} params.turmaId UUID da turma (filtro opcional).
 * @returns {Promise<{total_turmas: number, total_grupos: number, avaliacoes: {concluidas: number, pendentes: number}}>} Métricas calculadas.
 */
export async function obterMetricasDashboard({ turmaId }) {
  let gruposQuery = supabaseAdmin.from('grupos').select('id', { count: 'exact', head: true });
  if (turmaId) {
    gruposQuery = gruposQuery.eq('turma_id', turmaId);
  }

  const [turmas, grupos] = await Promise.all([
    supabaseAdmin.from('turmas').select('id', { count: 'exact', head: true }),
    gruposQuery,
  ]);

  let grupoIds = null;
  if (turmaId) {
    const { data, error } = await supabaseAdmin.from('grupos').select('id').eq('turma_id', turmaId);
    if (error) {
      throw new AppError(500, 'Falha ao consultar grupos da turma');
    }
    grupoIds = data.map((g) => g.id);
  }

  let totalIntegrantes = 0;
  let concluidas = 0;

  if (!turmaId || (grupoIds && grupoIds.length > 0)) {
    let integrantesQuery = supabaseAdmin.from('integrantes').select('id', { count: 'exact', head: true });
    let avaliacoesQuery = supabaseAdmin.from('avaliacoes').select('id', { count: 'exact', head: true });

    if (grupoIds) {
      integrantesQuery = integrantesQuery.in('grupo_id', grupoIds);
      avaliacoesQuery = avaliacoesQuery.in('grupo_id', grupoIds);
    }

    const [integrantes, avaliacoes] = await Promise.all([integrantesQuery, avaliacoesQuery]);

    if (integrantes.error || avaliacoes.error) {
      throw new AppError(500, 'Falha ao consultar avaliacoes');
    }

    totalIntegrantes = integrantes.count ?? 0;
    concluidas = avaliacoes.count ?? 0;
  }

  return {
    total_turmas: turmas.count ?? 0,
    total_grupos: grupos.count ?? 0,
    avaliacoes: {
      concluidas,
      pendentes: totalIntegrantes - concluidas,
    },
  };
}
