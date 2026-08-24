import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';
import { registrarAuditoria } from '../utils/audit.js';

/**
 * Cria a conta de acesso (auth.users) e o perfil (profiles) de um
 * Líder ou Vice-Líder. Executa apenas pelo Professor.
 *
 * Bloqueios de segurança aplicados:
 * - Segundo professor: rejeitado (role === 'professor').
 * - Aluno comum: rejeitado (role === 'aluno') — alunos não possuem conta.
 *
 * @param {Object} dados Dados validados do novo perfil.
 * @param {string} dados.nome Nome completo.
 * @param {string} dados.email E-mail único.
 * @param {string} dados.senha Senha de acesso.
 * @param {'lider'|'vice_lider'} dados.role Papel do novo perfil.
 * @param {string} professorId UUID do professor executor.
 * @returns {Promise<{id: string, nome: string, email: string, role: string}>} Perfil criado.
 * @throws {AppError} Em caso de tentativa de segundo professor, aluno comum ou falha de criação.
 */
export async function criarPerfil({ nome, email, senha, role }, professorId) {
  if (role === 'professor') {
    throw new AppError(400, 'Nao e permitido criar um segundo professor');
  }

  if (role === 'aluno') {
    throw new AppError(400, 'Alunos comuns nao possuem conta de acesso no sistema');
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (error || !data?.user) {
    throw new AppError(400, `Falha ao criar usuario de autenticacao: ${error?.message ?? 'erro desconhecido'}`);
  }

  const userId = data.user.id;

  const { error: insertError } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    nome,
    email,
    role,
    is_active: true,
  });

  if (insertError) {
    throw new AppError(400, `Falha ao criar perfil: ${insertError.message}`);
  }

  await registrarAuditoria('profiles', userId, 'INSERT', professorId, { nome, email, role });

  return { id: userId, nome, email, role };
}

/**
 * Lista perfis de Líder e Vice-Líder (útil para o Professor escolher papéis).
 *
 * @param {'lider'|'vice_lider'|undefined} role Filtro opcional por papel.
 * @returns {Promise<Array<Object>>} Lista de perfis ativos.
 */
export async function listarPerfis(role) {
  let query = supabaseAdmin
    .from('profiles')
    .select('id, nome, email, role, is_active')
    .eq('is_active', true)
    .in('role', ['lider', 'vice_lider'])
    .order('nome');

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(500, 'Falha ao listar perfis');
  }

  return data;
}
