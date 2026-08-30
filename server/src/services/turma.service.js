import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Lista as turmas cadastradas (3A, 3B, 3C, 3D).
 *
 * @returns {Promise<Array<Object>>} Lista de turmas.
 */
export async function listarTurmas() {
  const { data, error } = await supabaseAdmin.from('turmas').select('id, nome').order('nome');

  if (error) {
    throw new AppError(500, 'Falha ao listar turmas');
  }

  return data;
}
