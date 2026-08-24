import { supabaseAdmin } from '../config/supabase.js';
import { AppError, asyncHandler } from './error.middleware.js';

/**
 * Extrai o token JWT do header Authorization (esquema Bearer).
 *
 * @param {import('express').Request} req Requisição Express.
 * @returns {string} Token JWT.
 * @throws {AppError} Se o header estiver ausente ou malformado.
 */
const extractToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Token de acesso ausente ou invalido');
  }

  return token;
};

/**
 * Middleware de autenticação obrigatória.
 * Valida o JWT via Supabase Auth e carrega o perfil ativo do usuário
 * (professor, lider ou vice_lider) em `req.user`.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    throw new AppError(401, 'Sessao invalida ou expirada');
  }

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, email, role, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (perfilError || !perfil) {
    throw new AppError(401, 'Perfil nao localizado ou sem autorizacao de acesso');
  }

  if (perfil.is_active === false) {
    throw new AppError(401, 'Perfil desativado');
  }

  req.user = { id: perfil.id, nome: perfil.nome, email: perfil.email, role: perfil.role };
  return next();
});

/**
 * Middleware de autorização por papel (RBAC).
 *
 * @param {...('professor'|'lider'|'vice_lider')} roles Papéis permitidos.
 * @returns {Function} Middleware Express.
 */
export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'Acesso negado para o perfil atual'));
  }
  return next();
};
