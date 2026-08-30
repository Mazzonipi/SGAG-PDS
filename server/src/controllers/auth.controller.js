import { asyncHandler } from '../middlewares/error.middleware.js';
import { loginSchema } from '../validations/schemas.js';
import * as authService from '../services/auth.service.js';

/**
 * POST /api/auth/login — Autentica o usuário e retorna sessão + perfil.
 */
export const login = asyncHandler(async (req, res) => {
  const dados = loginSchema.parse(req.body);
  const resultado = await authService.login(dados);
  res.json(resultado);
});

/**
 * GET /api/auth/me — Retorna o perfil do usuário autenticado.
 */
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
