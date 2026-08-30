import { supabaseAdmin } from '../config/supabase.js';

/**
 * Registra um evento imutável na tabela audit_logs [BANCA-01].
 * Toda alteração de nota, grupo, integrante ou papel deve passar por aqui.
 *
 * @param {string} tabelaAfetada Nome da tabela alterada (profiles, turmas, grupos, integrantes, avaliacoes).
 * @param {string} registroId UUID do registro afetado.
 * @param {'INSERT'|'UPDATE'|'DELETE'|'OVERRIDE_NOTA'} acao Tipo de ação executada.
 * @param {string|null} usuarioId UUID do usuário responsável (perfil).
 * @param {Object} detalhes Detalhes estruturados da alteração.
 * @returns {Promise<void>} Promessa que resolve após o registro.
 */
export async function registrarAuditoria(tabelaAfetada, registroId, acao, usuarioId, detalhes) {
  await supabaseAdmin.from('audit_logs').insert({
    tabela_afetada: tabelaAfetada,
    registro_id: registroId,
    acao,
    usuario_id: usuarioId,
    detalhes,
  });
}
