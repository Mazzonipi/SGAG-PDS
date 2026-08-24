import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Lista o histórico imutável de alterações (audit_logs) [BANCA-01].
 * Acesso restrito ao Professor.
 *
 * @returns {Promise<Array<Object>>} Lista de logs ordenada do mais recente ao mais antigo.
 */
export async function listarAuditLogs() {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('id, tabela_afetada, registro_id, acao, usuario_id, detalhes, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new AppError(500, 'Falha ao consultar historico de alteracoes');
  }

  return data;
}
