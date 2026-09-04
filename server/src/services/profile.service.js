import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/error.middleware.js';
import { registrarAuditoria } from '../utils/audit.js';

/**
 * Cria a conta de acesso (auth.users) e o perfil (profiles) de um
 * Líder ou Vice-Líder. Executado apenas pelo Professor.
 *
 * O usuário é criado com user_metadata { role, nome }; a trigger do banco
 * valida o papel e cria o perfil automaticamente em profiles.
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
    user_metadata: { role, nome },
  });

  if (error || !data?.user) {
    const mensagem = error?.message || '';
    if (/already|registered|duplicate|exist/i.test(mensagem)) {
      throw new AppError(400, 'Este e-mail ja esta cadastrado.');
    }
    throw new AppError(400, 'Nao foi possivel criar o perfil. Verifique os dados e tente novamente.');
  }

  const userId = data.user.id;

  // A trigger já criou o perfil; apenas o buscamos para retornar.
  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, email, role, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (perfilError || !perfil) {
    throw new AppError(500, 'Falha ao criar o perfil. Tente novamente.');
  }

  await registrarAuditoria('profiles', userId, 'INSERT', professorId, { nome, email, role });

  return { id: perfil.id, nome: perfil.nome, email: perfil.email, role: perfil.role };
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
