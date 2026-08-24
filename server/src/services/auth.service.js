import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Autentica um usuário no Supabase Auth e retorna a sessão JWT
 * juntamente com o perfil ativo do sistema (professor, lider ou vice_lider).
 *
 * @param {Object} dados Dados de login validados.
 * @param {string} dados.email E-mail do usuário.
 * @param {string} dados.senha Senha do usuário.
 * @returns {Promise<{session: Object, user: Object}>} Sessão e perfil autenticados.
 * @throws {AppError} Se as credenciais forem inválidas ou o usuário não possuir perfil autorizado.
 */
export async function login({ email, senha }) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error || !data?.user) {
    throw new AppError(401, 'Credenciais invalidas');
  }

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, email, role, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (perfilError || !perfil) {
    throw new AppError(401, 'Usuario sem perfil autorizado no sistema');
  }

  if (perfil.is_active === false) {
    throw new AppError(403, 'Perfil desativado');
  }

  return { session: data.session, user: perfil };
}

/**
 * Retorna o perfil ativo de um usuário pelo seu UUID.
 *
 * @param {string} userId UUID do usuário (auth.users / profiles.id).
 * @returns {Promise<Object>} Perfil do usuário.
 * @throws {AppError} Se o perfil não for encontrado.
 */
export async function obterPerfil(userId) {
  const { data: perfil, error } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, email, role, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (error || !perfil) {
    throw new AppError(404, 'Perfil nao encontrado');
  }

  return perfil;
}
